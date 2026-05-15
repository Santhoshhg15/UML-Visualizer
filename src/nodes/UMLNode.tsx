import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useDiagramStore } from '@/store';
import { cn } from '@/utils/cn';
import { Plus, Trash2, Copy } from 'lucide-react';

/* ─── Type Definitions ─────────────────────────────────────── */

export interface UMLMember {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface UMLNodeData extends Record<string, unknown> {
  className: string;
  stereotype?: string;
  attributes: UMLMember[];
  methods: UMLMember[];
  accentColor?: string;
}

export type UMLNodeType = Node<UMLNodeData, 'umlClass'>;

/* ─── Inline Input Component ───────────────────────────────── */

interface InlineInputProps {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  className?: string;
  autoFocus?: boolean;
}

function InlineInput({ value, onSave, onCancel, className, autoFocus = true }: InlineInputProps) {
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSave(val);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <input
      ref={inputRef}
      className={cn(
        'bg-brand-500/10 border-b border-brand-500 outline-none w-full px-1 py-0.5 rounded-sm text-inherit font-inherit text-center',
        className
      )}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave(val)}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/* ─── Sub-Components ───────────────────────────────────────── */

interface MemberLineProps {
  nodeId: string;
  member: UMLMember;
  index: number;
  type: 'attributes' | 'methods';
}

function MemberLine({ nodeId, member, index, type }: MemberLineProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const nodes = useDiagramStore((s) => s.nodes);

  const visibilityColor: Record<string, string> = {
    '+': 'text-emerald-500',   // public
    '-': 'text-red-500',       // private
    '#': 'text-amber-500',     // protected
    '~': 'text-sky-500',       // package
  };

  const handleSave = (newVal: string) => {
    setIsEditing(false);
    // Basic parsing: split by ':' to get name and type
    const [namePart, typePart] = newVal.split(':').map(s => s.trim());
    if (!namePart) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const data = node.data as UMLNodeData;
    const newList = [...data[type]];
    
    // Attempt to parse visibility from the start of the namePart
    const visMatch = namePart.match(/^([+\-#~])\s*(.*)/);
    let visibility = member.visibility;
    let name = namePart;

    if (visMatch) {
      visibility = visMatch[1] as UMLMember['visibility'];
      name = visMatch[2];
    }

    newList[index] = {
      ...member,
      visibility,
      name,
      type: typePart || member.type
    };

    updateNodeData(nodeId, { [type]: newList });
  };

  if (isEditing) {
    const initialText = `${member.visibility} ${member.name}${member.type ? ` : ${member.type}` : ''}`;
    return (
      <div className="px-2 py-1">
        <InlineInput 
          value={initialText} 
          onSave={handleSave} 
          onCancel={() => setIsEditing(false)}
          className="text-left text-[12px] font-mono"
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={cn(
        'flex items-baseline gap-2 px-2 py-1 text-[12px] leading-snug font-mono tracking-tight text-surface-400 rounded-md hover:bg-surface-800/60 hover:text-surface-100 transition-colors cursor-text',
        member.isStatic && 'underline decoration-surface-500 underline-offset-2',
        member.isAbstract && 'italic'
      )}
    >
      <span className={cn('w-3 shrink-0 text-center font-bold', visibilityColor[member.visibility] ?? 'text-surface-500')}>
        {member.visibility}
      </span>
      <span className="text-surface-200">{member.name}</span>
      <span className="text-surface-500 font-bold">:</span>
      <span className="text-brand-400/90 font-medium">{member.type}</span>
    </div>
  );
}

function Section({ nodeId, members, type }: { nodeId: string, members: UMLMember[], type: 'attributes' | 'methods' }) {
  const addMember = useDiagramStore((s) => s.addMember);

  return (
    <div className="relative group/section">
      {members.length === 0 ? (
        <div className="px-4 py-3 text-center">
          <span className="text-[10px] italic text-surface-600 font-medium uppercase tracking-widest">— Empty —</span>
        </div>
      ) : (
        <div className="px-1.5 py-2">
          {members.map((m, i) => (
            <MemberLine key={`${m.visibility}${m.name}-${i}`} nodeId={nodeId} member={m} index={i} type={type} />
          ))}
        </div>
      )}
      
      {/* Quick Add Button */}
      <button
        onClick={() => addMember(nodeId, type)}
        className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 transition-all p-1.5 bg-brand-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 z-10"
        title={`Add ${type === 'attributes' ? 'Property' : 'Method'}`}
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

const UMLNode = memo(function UMLNode({ id, data, selected }: NodeProps<UMLNodeType>) {
  const {
    className,
    stereotype,
    attributes,
    methods,
    accentColor,
  } = data;

  const [editingField, setEditingField] = useState<'className' | 'stereotype' | null>(null);
  const accent = accentColor ?? 'var(--color-brand-500)';
  
  const removeNode = useDiagramStore((s) => s.removeNode);
  const duplicateNode = useDiagramStore((s) => s.duplicateNode);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);

  const handleSaveField = (val: string) => {
    if (editingField) {
      updateNodeData(id, { [editingField]: val });
      setEditingField(null);
    }
  };

  return (
    <div
      className={cn(
        'group min-w-[260px] max-w-[360px] relative rounded-xl border bg-surface-900 shadow-node transition-all duration-200',
        selected 
          ? 'border-brand-500 ring-1 ring-brand-500/20 shadow-glow' 
          : 'border-surface-800 hover:border-surface-700'
      )}
      style={{
        borderTopWidth: '4px',
        borderTopColor: accent,
      }}
    >
      {/* Node Context Toolbar (Top) */}
      {selected && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface-900 border border-surface-800 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => duplicateNode(id)}
            className="p-1.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-md transition-colors"
            title="Duplicate (Ctrl+D)"
          >
            <Copy size={14} />
          </button>
          <div className="w-px h-4 bg-surface-800 mx-1" />
          <button
            onClick={() => removeNode(id)}
            className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
            title="Delete (Del)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-surface-950 !border-brand-500 !w-2.5 !h-2.5 !-top-1.5"
      />

      {/* Header */}
      <div className="px-5 pt-5 pb-4 text-center">
        <div 
          className="min-h-[14px]"
          onDoubleClick={() => setEditingField('stereotype')}
        >
          {editingField === 'stereotype' ? (
            <InlineInput 
              value={stereotype || ''} 
              onSave={handleSaveField} 
              onCancel={() => setEditingField(null)}
              className="text-[9px] uppercase tracking-widest"
            />
          ) : (
            <div className="text-[9px] font-bold tracking-[0.2em] text-brand-400 uppercase cursor-text">
              «{stereotype || 'Class'}»
            </div>
          )}
        </div>

        <div 
          className="mt-1 min-h-[20px]"
          onDoubleClick={() => setEditingField('className')}
        >
          {editingField === 'className' ? (
            <InlineInput 
              value={className} 
              onSave={handleSaveField} 
              onCancel={() => setEditingField(null)}
              className="text-[16px] font-bold"
            />
          ) : (
            <div className="text-[16px] font-bold tracking-tight text-surface-50 cursor-text">
              {className}
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 border-t border-surface-800/80" />
      <Section nodeId={id} members={attributes} type="attributes" />
      <div className="mx-4 border-t border-surface-800/80" />
      <Section nodeId={id} members={methods} type="methods" />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-surface-950 !border-brand-500 !w-2.5 !h-2.5 !-bottom-1.5"
      />
    </div>
  );
});

export default UMLNode;
