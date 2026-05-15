import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { parseTextToUML } from '@/ai/parser';
import { generateReactFlowDiagram } from '@/ai/generators';
import { validateSchema } from '@/ai/validation';
import type { ValidationError } from '@/ai/validation';
import { interpretNaturalLanguage } from '@/ai/interpreter/interpretNaturalLanguage';
import { useDiagramStore } from '@/store';
import { UMLCodeEditor } from './editor/UMLCodeEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, ArrowRight, Trash2, X, ChevronDown, Info, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * ── DEBOUNCE DELAY ────────────────────────────────
 */
const DEBOUNCE_MS = 400;

type EditorMode = 'dsl' | 'ai';

const PLACEHOLDER_DSL = `Class Animal
Attributes:
- name : String

Class Tiger extends Animal`;

const PLACEHOLDER_AI = `Describe your architecture in English...
e.g. "Create a class Animal. Create a Tiger that extends Animal."`;

export function TextToUMLPanel() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<EditorMode>('dsl');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { setNodes, setEdges, clearDiagram } = useDiagramStore();
  const { fitView } = useReactFlow();

  const hasGeneratedRef = useRef(false);

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
        // Step 1: Parse text (DSL Mode)
        schema = parseTextToUML(text);
      }

      // Step 2: Validate schema semantics (AI and DSL both use this)
      const result = validateSchema(schema);
      setValidationErrors(result.errors);

      // Step 3: Generate only if validation passes
      if (!result.valid) {
        clearDiagram();
        hasGeneratedRef.current = false;
        return;
      }

      // Step 4: Generate schema → React Flow nodes & edges
      const { nodes, edges } = generateReactFlowDiagram(schema);

      // Step 5: Push into store
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

  /**
   * ── MANUAL GENERATION ───────────────────────────
   */
  const handleGenerate = useCallback(() => {
    if (!input.trim() || isInterpreting) return;
    generateDiagram(input, { fitView: true });
  }, [input, isInterpreting, generateDiagram]);

  /**
   * ── DEBOUNCED LIVE SYNCHRONIZATION ──────────────
   * Only active in DSL mode to prevent excessive AI calls.
   */
  useEffect(() => {
    if (mode === 'ai') return; // AI Mode requires explicit trigger

    if (!input.trim()) {
      clearDiagram();
      setValidationErrors([]);
      hasGeneratedRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      generateDiagram(input);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [input, mode, generateDiagram, clearDiagram]);

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningCount = validationErrors.filter((e) => e.severity === 'warning').length;

  return (
    <motion.div
      initial={{ y: -20, x: 20, opacity: 0 }}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex flex-col pointer-events-auto"
      style={{
        right: 'var(--viewport-offset)',
        top: 'var(--viewport-offset)',
        width: '420px',
        minWidth: '320px',
        maxWidth: '800px',
        maxHeight: 'calc(100vh - 100px)',
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--panel-blur))',
        border: 'var(--panel-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-panel)',
        zIndex: 'var(--z-toolbar)',
        resize: 'horizontal',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height: '48px',
          paddingInline: 'var(--space-4)',
          borderBottom: 'var(--panel-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Zap size={14} fill="currentColor" />
          </div>
          <h3 className="text-[11px] font-bold tracking-[0.08em] text-surface-50 uppercase">Text-to-UML</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="text-surface-600 hover:text-surface-200 transition-colors p-1"
            title="Command Menu"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>
          <div className="w-px h-3 bg-white/10" />
          <button
            onClick={() => {/* potential close logic */ }}
            className="text-surface-600 hover:text-red-400 transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Mode Toggle & Status */}
        <div className="flex items-center justify-between">
          <div className="relative flex p-1 bg-surface-950/50 rounded-xl border border-white/5">
            <button
              onClick={() => { setMode('dsl'); setValidationErrors([]); }}
              className={cn(
                "relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-colors",
                mode === 'dsl' ? "text-white" : "text-surface-500 hover:text-surface-300"
              )}
            >
              DSL
              {mode === 'dsl' && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-brand-600 rounded-lg -z-10 shadow-lg shadow-brand-900/20"
                />
              )}
            </button>
            <button
              onClick={() => { setMode('ai'); setValidationErrors([]); }}
              className={cn(
                "relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-colors",
                mode === 'ai' ? "text-white" : "text-surface-500 hover:text-surface-300"
              )}
            >
              AI
              {mode === 'ai' && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-brand-600 rounded-lg -z-10 shadow-lg shadow-brand-900/20"
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

        {/* Body */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.08em]">
              {mode === 'ai' ? 'Natural Language' : 'Diagram DSL'}
            </label>
            <div className="flex items-center gap-2 px-2 py-1 bg-surface-950/40 border border-white/5 rounded-lg text-surface-400">
              <span className="text-[9px] font-bold">Gemini Pro</span>
              <ChevronDown size={10} strokeWidth={3} />
            </div>
          </div>

          <div className="editor-container relative border border-white/5 rounded-xl bg-surface-950/40 overflow-hidden">
            {mode === 'dsl' ? (
              <UMLCodeEditor
                value={input}
                onChange={setInput}
                errors={validationErrors}
              />
            ) : (
              <textarea
                className="w-full bg-transparent p-4 text-[12px] text-surface-200 outline-none resize-none leading-relaxed placeholder:text-surface-700"
                style={{ minHeight: '240px' }}
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

      <div
        className="flex items-center gap-3 p-4 shrink-0"
        style={{
          borderTop: 'var(--panel-border)',
          background: 'rgba(15, 23, 42, 0.3)',
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
        }}
      >
        <button
          className={cn(
            "flex-1 h-10 px-4 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2.5",
            errorCount > 0
              ? "bg-surface-900 text-surface-700 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20 active:scale-95"
          )}
          onClick={handleGenerate}
          disabled={errorCount > 0 || isInterpreting}
        >
          {isInterpreting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles size={14} fill="white" />
              {mode === 'ai' ? 'Interpret' : 'Generate'}
              <ArrowRight size={14} className="opacity-50" />
            </>
          )}
        </button>
        <button
          className="h-10 px-4 rounded-xl text-[11px] font-bold transition-all hover:bg-surface-800 text-surface-400 border border-white/5 flex items-center gap-2"
          onClick={() => { setInput(''); clearDiagram(); setValidationErrors([]); }}
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>
      {/* Resize handle visual hint */}
      <div 
        className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, var(--surface-500) 50%)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          borderRadius: '0 0 4px 0',
        }}
      />
    </motion.div>
  );
}


