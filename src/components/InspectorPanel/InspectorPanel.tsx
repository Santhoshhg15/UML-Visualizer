/**
 * InspectorPanel.tsx
 * ──────────────────────────────────────────────────
 * Node property inspector — right floating panel.
 *
 * ERGONOMICS RULES:
 * ─────────────────
 * • Width: var(--inspector-width) = 260px
 * • Padding: var(--space-4) all sides, var(--space-3) between field groups
 * • Field rows: label (80px fixed, text-2xs uppercase), input (flex: 1)
 * • Input height: var(--input-height-sm) = 28px for inline rows
 * • Section headings: text-2xs uppercase, 0.5px bottom border
 * • Max 2 distinct font sizes within the panel
 * • Smooth scroll on panel body, 2px custom scrollbar
 * • No redundant labels that repeat placeholder text
 */

import { useDiagramStore } from '@/store';
import type { UMLNodeData, UMLMember } from '@/nodes';
import { X, Plus, Trash2 } from 'lucide-react';
import { Panel } from '@xyflow/react';
import { cn } from '@/utils/cn';

export default function InspectorPanel() {
  const selectedNodeId   = useDiagramStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useDiagramStore((s) => s.setSelectedNodeId);
  const nodes            = useDiagramStore((s) => s.nodes);
  const updateNodeData   = useDiagramStore((s) => s.updateNodeData);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data as UMLNodeData | undefined;

  if (!selectedNodeId || !data) return null;

  const updateField = (field: keyof UMLNodeData, value: unknown) => {
    updateNodeData(selectedNodeId, { [field]: value });
  };

  const updateMember = (
    type: 'attributes' | 'methods',
    index: number,
    field: keyof UMLMember,
    value: string
  ) => {
    const list = [...(data[type] || [])];
    list[index] = { ...list[index], [field]: value };
    updateField(type, list);
  };

  const addMember = (type: 'attributes' | 'methods') => {
    const list = [...(data[type] || [])];
    list.push({ visibility: '+', name: 'member', type: 'any' });
    updateField(type, list);
  };

  const removeMember = (type: 'attributes' | 'methods', index: number) => {
    const list = [...(data[type] || [])];
    list.splice(index, 1);
    updateField(type, list);
  };

  return (
    <Panel position="top-right" className="m-0" style={{ zIndex: 'var(--z-panel)', top: 0, right: 0 }}>
      <div
        className="flex flex-col bg-surface-900/40 backdrop-blur-xl"
        style={{
          width:        'var(--inspector-width)',
          height:       '100dvh',
          borderLeft:   'var(--panel-border)',
          background:   'var(--panel-bg)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height:        '48px',
            paddingInline: 'var(--space-4)',
            borderBottom:  'var(--panel-border)',
          }}
        >
          <span
            className="text-surface-50 select-none"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Inspector
          </span>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          className="panel-scroll flex-1"
          style={{ padding: 'var(--space-4)' }}
        >

          {/* ── Section: Class Meta ── */}
          <SectionHeading>Identity</SectionHeading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <FieldRow label="Name">
              <input
                className="editor-input"
                type="text"
                value={data.className || ''}
                onChange={e => updateField('className', e.target.value)}
                style={{ height: 'var(--input-height-sm)' }}
              />
            </FieldRow>
            <FieldRow label="Stereo">
              <input
                className="editor-input"
                type="text"
                value={data.stereotype || ''}
                onChange={e => updateField('stereotype', e.target.value)}
                placeholder="abstract"
                style={{ height: 'var(--input-height-sm)' }}
              />
            </FieldRow>
          </div>

          <div className="editor-divider" style={{ marginBlock: 'var(--space-5)' }} />

          {/* ── Section: Attributes ── */}
          <div className="flex items-center justify-between">
            <SectionHeading>Attributes</SectionHeading>
            <button
              onClick={() => addMember('attributes')}
              className="flex items-center justify-center rounded-md text-surface-500 hover:text-brand-400 hover:bg-surface-800 transition-colors"
              style={{ width: 22, height: 22 }}
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {data.attributes.length === 0 && <EmptyState />}
            {data.attributes.map((attr, idx) => (
              <MemberRow
                key={idx}
                member={attr}
                onVisChange={v  => updateMember('attributes', idx, 'visibility', v)}
                onNameChange={n => updateMember('attributes', idx, 'name', n)}
                onTypeChange={t => updateMember('attributes', idx, 'type', t)}
                onRemove={() => removeMember('attributes', idx)}
              />
            ))}
          </div>

          <div className="editor-divider" style={{ marginBlock: 'var(--space-5)' }} />

          {/* ── Section: Methods ── */}
          <div className="flex items-center justify-between">
            <SectionHeading>Methods</SectionHeading>
            <button
              onClick={() => addMember('methods')}
              className="flex items-center justify-center rounded-md text-surface-500 hover:text-brand-400 hover:bg-surface-800 transition-colors"
              style={{ width: 22, height: 22 }}
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {data.methods.length === 0 && <EmptyState />}
            {data.methods.map((method, idx) => (
              <MemberRow
                key={idx}
                member={method}
                onVisChange={v  => updateMember('methods', idx, 'visibility', v)}
                onNameChange={n => updateMember('methods', idx, 'name', n)}
                onTypeChange={t => updateMember('methods', idx, 'type', t)}
                onRemove={() => removeMember('methods', idx)}
              />
            ))}
          </div>

          <div style={{ height: 'var(--space-6)' }} />
        </div>
      </div>
    </Panel>
  );
}

/* ── Sub-components ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-surface-500 select-none mb-4"
      style={{
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        paddingBottom: 'var(--space-2)',
        borderBottom:  'var(--panel-border)',
      }}
    >
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
      <span
        className="text-surface-600 select-none shrink-0"
        style={{
          width:         80,
          fontSize:      'var(--text-2xs)',
          fontWeight:    600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function MemberRow({
  member,
  onVisChange,
  onNameChange,
  onTypeChange,
  onRemove,
}: {
  member: UMLMember;
  onVisChange:  (v: string) => void;
  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onRemove: () => void;
}) {
  const visColor: Record<string, string> = {
    '+': '#10b981', '-': '#ef4444', '#': '#f59e0b', '~': '#38bdf8',
  };

  return (
    <div className="group flex items-center" style={{ gap: 'var(--space-1)' }}>
      {/* Visibility selector */}
      <select
        value={member.visibility}
        onChange={e => onVisChange(e.target.value)}
        style={{
          width:        28,
          height:       'var(--input-height-sm)',
          borderRadius: 'var(--radius-sm)',
          border:       'var(--divider-width) solid var(--divider-color)',
          background:   'rgba(6, 8, 22, 0.4)',
          fontSize:     'var(--text-xs)',
          fontWeight:   600,
          color:        visColor[member.visibility] ?? 'var(--text-secondary)',
          textAlign:    'center',
          cursor:       'pointer',
          outline:      'none',
          appearance:   'none',
          flexShrink:   0,
        }}
      >
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="#">#</option>
        <option value="~">~</option>
      </select>

      {/* Name */}
      <input
        type="text"
        value={member.name}
        onChange={e => onNameChange(e.target.value)}
        style={{
          flex:         1,
          minWidth:     0,
          height:       'var(--input-height-sm)',
          borderRadius: 'var(--radius-sm)',
          border:       'var(--divider-width) solid var(--subtle-border)',
          background:   'rgba(6, 8, 22, 0.4)',
          padding:      '0 6px',
          fontSize:     'var(--text-xs)',
          color:        'var(--text-primary)',
          fontFamily:   'ui-monospace, monospace',
          outline:      'none',
        }}
      />

      {/* Colon */}
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-surface-600)', flexShrink: 0 }}>:</span>

      {/* Type */}
      <input
        type="text"
        value={member.type}
        onChange={e => onTypeChange(e.target.value)}
        style={{
          width:        52,
          height:       'var(--input-height-sm)',
          borderRadius: 'var(--radius-sm)',
          border:       'var(--divider-width) solid var(--subtle-border)',
          background:   'rgba(6, 8, 22, 0.4)',
          padding:      '0 5px',
          fontSize:     'var(--text-xs)',
          color:        'var(--accent-cyan)',
          fontFamily:   'ui-monospace, monospace',
          fontWeight:   600,
          outline:      'none',
          flexShrink:   0,
        }}
      />

      {/* Remove */}
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-600 hover:text-red-400 flex items-center justify-center shrink-0"
        style={{ width: 20, height: 20 }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="text-surface-600 text-center select-none"
      style={{
        fontSize:     'var(--text-2xs)',
        fontWeight:   500,
        letterSpacing: '0.06em',
        padding:      'var(--space-3) 0',
        borderRadius: 'var(--radius-lg)',
        border:       'var(--divider-width) dashed var(--divider-color)',
        opacity:      0.4,
      }}
    >
      None
    </div>
  );
}
