import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { parseTextToUML } from '@/ai/parser';
import { generateReactFlowDiagram } from '@/ai/generators';
import { validateSchema } from '@/ai/validation';
import type { ValidationError } from '@/ai/validation';
import { interpretNaturalLanguage } from '@/ai/interpreter/interpretNaturalLanguage';
import { useDiagramStore } from '@/store';
import { UMLCodeEditor } from './editor/UMLCodeEditor';
import { motion, useDragControls } from 'framer-motion';
import { Zap, Sparkles, ArrowRight, Trash2, X, ChevronDown, Info, Loader2, GripHorizontal, Minimize2, Maximize2, MoveDiagonal2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * ── DEBOUNCE DELAY ────────────────────────────────
 */
const DEBOUNCE_MS = 400;

type EditorMode = 'dsl' | 'ai';

const PLACEHOLDER_AI = `Describe your architecture in English...
e.g. "Create a class Animal. Create a Tiger that extends Animal."`;

export function TextToUMLPanel() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<EditorMode>('dsl');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Bidirectional Resizing State
  const [dimensions, setDimensions] = useState({ width: 440, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState<'h' | 'v' | 'both' | null>(null);

  const { setNodes, setEdges, clearDiagram } = useDiagramStore();
  const { fitView } = useReactFlow();
  const dragControls = useDragControls();
  const hasGeneratedRef = useRef(false);

  // Resize handler logic
  const handleResizeStart = (e: React.MouseEvent, type: 'h' | 'v' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeMode(type);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setDimensions({
        width:  type === 'v' ? startWidth : Math.max(340, Math.min(800, startWidth - deltaX)),
        height: type === 'h' ? startHeight : Math.max(400, Math.min(900, startHeight + deltaY)),
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      setResizeMode(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = type === 'both' ? 'nwse-resize' : type === 'h' ? 'ew-resize' : 'ns-resize';
  };

  /**
   * ── SHARED GENERATION PIPELINE ──────────────────
   */
  const generateDiagram = useCallback(
    async (text: string, options: { fitView?: boolean; forceAI?: boolean } = {}) => {
      let schema;
      setApiError(null);

      if (mode === 'ai' || options.forceAI) {
        setIsInterpreting(true);
        try {
          schema = await interpretNaturalLanguage(text);
        } catch (err: any) {
          console.error('AI Interpretation failed', err);
          setApiError(err.message || 'AI Interpretation failed. Please check your API key.');
          return;
        } finally {
          setIsInterpreting(false);
        }
      } else {
        schema = parseTextToUML(text);
      }

      const result = validateSchema(schema);
      setValidationErrors(result.errors);

      if (!result.valid) {
        clearDiagram();
        hasGeneratedRef.current = false;
        return;
      }

      const { nodes, edges } = generateReactFlowDiagram(schema);
      setNodes(nodes);
      setEdges(edges);
      hasGeneratedRef.current = true;

      if (options.fitView) {
        setTimeout(() => {
          fitView({ padding: 0.3, duration: 400 });
        }, 50);
      }
    },
    [mode, setNodes, setEdges, fitView, clearDiagram]
  );

  const handleGenerate = useCallback(() => {
    if (!input.trim() || isInterpreting) return;
    generateDiagram(input, { fitView: true });
  }, [input, isInterpreting, generateDiagram]);

  useEffect(() => {
    if (mode === 'ai') return;
    if (!input.trim()) {
      clearDiagram();
      setValidationErrors([]);
      hasGeneratedRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      generateDiagram(input);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input, mode, generateDiagram, clearDiagram]);

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={false}
      initial={{ y: -20, x: 20, opacity: 0 }}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex flex-col pointer-events-auto"
      style={{
        right: 'var(--viewport-offset)',
        top: 'var(--viewport-offset)',
        width:  dimensions.width,
        height: dimensions.height,
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--panel-blur))',
        border: 'var(--panel-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(120, 140, 255, 0.08)',
        zIndex: 'var(--z-toolbar)',
        overflow: 'hidden',
        userSelect: isResizing ? 'none' : 'auto',
      }}
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing select-none border-b border-white/[0.04]"
        style={{
          height: '52px',
          paddingInline: 'var(--space-5)',
          background: 'rgba(255, 255, 255, 0.01)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Zap size={14} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[10px] font-bold tracking-[0.15em] text-surface-50/80 uppercase">Architecture Console</h3>
            <span className="text-[9px] text-surface-500 font-medium">Text-to-UML Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <HeaderAction icon={<Minimize2 size={13} />} title="Minimize" />
          <HeaderAction icon={<Maximize2 size={13} />} title="Expand" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <HeaderAction icon={<X size={14} />} title="Close" danger />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col min-h-0 gap-6">
        {/* Mode Toggle (Segmented Control) */}
        <div className="flex items-center justify-between">
          <div className="relative flex p-1 bg-surface-950/60 rounded-xl border border-white/[0.04] w-[180px]">
            <button
              onClick={() => { setMode('dsl'); setValidationErrors([]); }}
              className={cn(
                "relative z-10 flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-200",
                mode === 'dsl' ? "text-white" : "text-surface-500 hover:text-surface-300"
              )}
            >
              DSL Mode
              {mode === 'dsl' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 bg-white/[0.08] rounded-lg -z-10 border border-white/10 shadow-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => { setMode('ai'); setValidationErrors([]); }}
              className={cn(
                "relative z-10 flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-200",
                mode === 'ai' ? "text-white" : "text-surface-500 hover:text-surface-300"
              )}
            >
              AI Assistant
              {mode === 'ai' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 bg-white/[0.08] rounded-lg -z-10 border border-white/10 shadow-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>

          {validationErrors.length > 0 && !isInterpreting && (
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10"
              >
                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
              </span>
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-500" />
              <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                {mode === 'ai' ? 'Architectural Prompt' : 'UML Definition (DSL)'}
              </label>
            </div>
            {mode === 'ai' && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-surface-500">
                <Sparkles size={11} className="text-brand-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Gemini 1.5 Pro</span>
              </div>
            )}
          </div>

          <div className="flex-1 relative border border-white/[0.06] rounded-2xl bg-surface-950/20 overflow-hidden transition-all duration-300 focus-within:border-brand-500/30 group">
            {mode === 'dsl' ? (
              <UMLCodeEditor
                value={input}
                onChange={setInput}
                errors={validationErrors}
              />
            ) : (
              <textarea
                className="w-full h-full bg-transparent p-5 text-[13px] text-surface-100 outline-none resize-none leading-relaxed placeholder:text-surface-700/60 font-medium"
                placeholder={PLACEHOLDER_AI}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isInterpreting}
              />
            )}

            {isInterpreting && (
              <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest animate-pulse">Processing</span>
                </div>
              </div>
            )}

            {/* Char count */}
            {mode === 'ai' && (
              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-surface-700">
                {input.length} / 2000
              </div>
            )}
          </div>
        </div>

        {/* ── API Errors Display ────────────────────────── */}
        {apiError && !isInterpreting && (
          <div
            className="flex items-start gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] text-red-400"
          >
            <span className="shrink-0">✕</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* ── Validation Errors Display ────────────────── */}
        {validationErrors.length > 0 && !isInterpreting && (
          <div
            className="flex flex-col gap-1 overflow-y-auto"
            style={{
              maxHeight: '120px',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.5)',
              border: `1px solid ${errorCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            }}
          >
            {validationErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                <span className="shrink-0 mt-px" style={{ color: err.severity === 'error' ? '#f87171' : '#fbbf24' }}>
                  {err.severity === 'error' ? '✕' : '⚠'}
                </span>
                <span style={{ color: err.severity === 'error' ? 'rgba(248, 113, 113, 0.9)' : 'rgba(251, 191, 36, 0.9)' }}>
                  {err.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Helper info */}
        <div className="flex gap-2.5 items-start">
          <span className="shrink-0 mt-0.5 text-brand-500/50">
            <Info size={14} />
          </span>
          <p className="text-[10px] text-surface-500 leading-relaxed">
            {mode === 'ai'
              ? <>Describe your architecture and click <span className="text-brand-400 font-bold">Interpret</span> to generate UML.</>
              : 'Diagram updates live as you type architectural definitions.'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-4 p-5 shrink-0 border-t border-white/[0.04]"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
        }}
      >
        <button
          className={cn(
            "flex-1 h-11 px-6 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-3",
            errorCount > 0
              ? "bg-surface-900 text-surface-700 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-2xl shadow-brand-900/30 active:scale-[0.98]"
          )}
          onClick={handleGenerate}
          disabled={errorCount > 0 || isInterpreting}
        >
          {isInterpreting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles size={15} className={mode === 'ai' ? 'animate-pulse' : ''} />
              <span className="tracking-wide">{mode === 'ai' ? 'Interpret Architecture' : 'Generate Diagram'}</span>
              <ArrowRight size={14} className="opacity-40 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <button
          className="w-11 h-11 rounded-xl flex items-center justify-center text-surface-500 hover:text-red-400 hover:bg-red-400/10 border border-white/[0.04] transition-all"
          onClick={() => { setInput(''); clearDiagram(); setValidationErrors([]); }}
          title="Clear Canvas"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ── Resize Handles ── */}
      {/* Right Edge */}
      <div 
        className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-brand-500/20 transition-colors z-[100]"
        onMouseDown={(e) => handleResizeStart(e, 'h')}
      />
      {/* Bottom Edge */}
      <div 
        className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-brand-500/20 transition-colors z-[100]"
        onMouseDown={(e) => handleResizeStart(e, 'v')}
      />
      {/* Corner */}
      <div 
        className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-[110] flex items-end justify-end p-1 hover:text-brand-400 text-surface-700 transition-colors"
        onMouseDown={(e) => handleResizeStart(e, 'both')}
      >
        <MoveDiagonal2 size={12} />
      </div>
    </motion.div>
  );
}

function HeaderAction({ icon, title, danger, onClick }: { icon: React.ReactNode, title: string, danger?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
        danger 
          ? "text-surface-600 hover:text-red-400 hover:bg-red-400/10" 
          : "text-surface-600 hover:text-surface-200 hover:bg-white/5"
      )}
    >
      {icon}
    </button>
  );
}


