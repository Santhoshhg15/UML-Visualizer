import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { parseTextToUML } from '@/ai/parser';
import { generateReactFlowDiagram } from '@/ai/generators';
import { validateSchema } from '@/ai/validation';
import type { ValidationError } from '@/ai/validation';
import { interpretNaturalLanguage } from '@/ai/interpreter/interpretNaturalLanguage';
import { useDiagramStore, useWindowDepth, useWindowStore } from '@/store';
import { UMLCodeEditor } from './editor/UMLCodeEditor';
import { motion, useDragControls, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { Zap, Sparkles, ArrowRight, Trash2, Info, Loader2, MoveDiagonal2, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * ── DEBOUNCE DELAY ────────────────────────────────
 */
const DEBOUNCE_MS = 400;

type EditorMode = 'dsl' | 'ai';

const PLACEHOLDER_AI = `Describe your architecture in English...
e.g. "Create a class Animal. Create a Tiger that extends Animal."`;

const AI_STATUS_MESSAGES = [
  "Parsing architecture...",
  "Detecting relationships...",
  "Building UML schema...",
  "Applying layout..."
];

const SESSION_KEY = 'architecture_console_session';
const loadSession = () => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {};
};

export function TextToUMLPanel() {
  const session = useRef(loadSession()).current;

  const [input, setInput] = useState<string>(session.input ?? '');
  const [mode, setMode] = useState<EditorMode>(session.mode ?? 'dsl');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (!isInterpreting) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % AI_STATUS_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isInterpreting]);

  // Bidirectional Resizing State
  const [dimensions, setDimensions] = useState(session.dimensions ?? { width: 440, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [, setResizeMode] = useState<'h' | 'v' | 'both' | null>(null);

  type WindowState = 'normal' | 'collapsed' | 'expanded';
  const [windowState, setWindowState] = useState<WindowState>(session.windowState ?? 'normal');
  const [dock, setDock] = useState<{side: 'left' | 'right', top: number}>(session.dock ?? { side: 'left', top: 24 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (windowState === 'collapsed' || windowState === 'expanded') {
      animate(x, 0, { type: 'spring', duration: 0.4, bounce: 0 });
      animate(y, 0, { type: 'spring', duration: 0.4, bounce: 0 });
    }
  }, [windowState, x, y]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        input, mode, dimensions, windowState, dock
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [input, mode, dimensions, windowState, dock]);

  const { setNodes, setEdges, clearDiagram } = useDiagramStore();
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const inspectorOffset = selectedNodeId ? 282 : 24; // 250px width + 32px padding/margin
  const { fitView } = useReactFlow();
  const dragControls = useDragControls();
  const hasGeneratedRef = useRef(false);

  const { zIndex, isActive } = useWindowDepth('architecture-console');
  const bringToFront = useWindowStore((s) => s.bringToFront);

  useEffect(() => {
    bringToFront('architecture-console');
  }, [bringToFront]);

  const [viewportSize, setViewportSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1000, height: typeof window !== 'undefined' ? window.innerHeight : 800 });

  useEffect(() => {
    const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resize handler logic
  const handleResizeStart = (e: React.MouseEvent, type: 'h' | 'v' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeMode(type);

    if (windowState !== 'normal') {
      setWindowState('normal');
    }
    
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
        } catch (err: unknown) {
          console.error('AI Interpretation failed', err);
          const message = err instanceof Error ? err.message : 'AI Interpretation failed. Please check your API key.';
          setApiError(message);
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
      setTimeout(() => setValidationErrors([]), 0);
      hasGeneratedRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      generateDiagram(input);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input, mode, generateDiagram, clearDiagram]);

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;

  const panelVariants = {
    normal: {
      width: dimensions.width,
      height: dimensions.height,
      opacity: 1,
      scale: 1,
      top: dock.top,
      left: dock.side === 'left' ? 24 : viewportSize.width - dimensions.width - inspectorOffset,
      right: 'auto',
    },
    collapsed: {
      width: 48,
      height: 200,
      opacity: 1,
      scale: 1,
      top: 'calc(50vh - 100px)',
      left: dock.side === 'left' ? 12 : viewportSize.width - 60,
      right: 'auto',
    },
    expanded: {
      width: '85vw',
      height: '80vh',
      opacity: 1,
      scale: 1,
      top: '10vh',
      left: '7.5vw',
      right: 'auto',
    }
  };

  return (
    <motion.div
      drag={windowState === 'normal'}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragListener={false}
      onDragEnd={() => {
        const currentLeft = (dock.side === 'left' ? 24 : viewportSize.width - dimensions.width - inspectorOffset) + x.get();
        const currentTop = dock.top + y.get();
        
        const isLeft = currentLeft + (dimensions.width / 2) < viewportSize.width / 2;
        
        setDock({
          side: isLeft ? 'left' : 'right',
          top: Math.max(24, Math.min(currentTop, viewportSize.height - dimensions.height - 24))
        });
        
        animate(x, 0, { type: 'spring', bounce: 0, duration: 0.4 });
        animate(y, 0, { type: 'spring', bounce: 0, duration: 0.4 });
      }}
      onPointerDownCapture={() => bringToFront('architecture-console')}
      variants={panelVariants}
      initial="normal"
      animate={windowState}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className={cn("absolute flex flex-col pointer-events-auto transition-colors duration-300", isActive ? "" : "opacity-95")}
      style={{
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--panel-blur))',
        border: isActive ? '1px solid rgba(120, 140, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isActive 
          ? '0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(120, 140, 255, 0.08)' 
          : '0 12px 30px -12px rgba(0, 0, 0, 0.3)',
        zIndex,
        overflow: 'hidden',
        userSelect: isResizing ? 'none' : 'auto',
        x,
        y,
      }}
    >
      <AnimatePresence mode="wait">
        {windowState === 'collapsed' ? (
          <motion.div
            key="dock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors group select-none"
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => setWindowState('normal')}
            title="Restore Console"
          >
            <div className="p-2 mb-4 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20 group-hover:shadow-[0_0_12px_rgba(120,140,255,0.4)] transition-all">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-surface-400 uppercase group-hover:text-surface-200 transition-colors" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Console
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full h-full"
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
                <HeaderAction 
                  icon={<Minus size={14} />} 
                  title="Collapse" 
                  onClick={() => setWindowState('collapsed')} 
                />
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

            <AnimatePresence>
              {isInterpreting && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-3 left-3 right-3 h-10 bg-surface-900/80 backdrop-blur-md border border-white/[0.08] rounded-xl flex items-center justify-between px-4 shadow-lg z-10"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={12} className="text-brand-400 animate-pulse" />
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={statusIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="text-[10px] font-medium text-brand-100 tracking-wide"
                      >
                        {AI_STATUS_MESSAGES[statusIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-1.5">
                     <motion.div className="w-1 h-1 bg-brand-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                     <motion.div className="w-1 h-1 bg-brand-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                     <motion.div className="w-1 h-1 bg-brand-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resize Handles ── */}
      {windowState !== 'collapsed' && (
        <>
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
        </>
      )}
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


