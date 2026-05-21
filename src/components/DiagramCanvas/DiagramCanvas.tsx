/**
 * DiagramCanvas.tsx
 * ══════════════════════════════════════════════════════════════
 * The core React Flow canvas component for the UML Visualizer.
 *
 * TOOLBAR ERGONOMICS:
 * ───────────────────
 * • Height: var(--toolbar-height) = 48px
 * • Centered horizontally, 20px from bottom
 * • Icon buttons: 32x32px with --radius-md
 * • Groups separated by 1px × 16px muted dividers
 * • Hover: background fill only, 120ms, no scale/bounce
 * • Z-index: var(--z-toolbar)
 *
 * MINIMAP:
 * ────────
 * • Dimensions: 160 × 110px (tokens)
 * • Bottom-right, 20px from edges
 * • Z-index: var(--z-minimap)
 * • No labels, just ambient position indicator
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  type ColorMode,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useDiagramStore, useAppStore } from '@/store';
import { nodeTypes } from '@/nodes';
import { edgeTypes } from '@/edges';
import { exportToPNG, exportToSVG } from '@/utils/exportDiagram';
import { Trash2, Save, FolderOpen, DownloadCloud, UploadCloud, Layout, Loader2, Plus, Copy, Layers } from 'lucide-react';
import { getLayoutedElements } from '@/utils/elk';
import { InspectorPanel } from '@/components';
import { saveToStorage, loadFromStorage } from '@/utils/persistence';
import { serializeDiagram, deserializeDiagram } from '@/utils/serialization';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

import type { Node } from '@xyflow/react';

function FlowAutoResizer() {
  const { fitView } = useReactFlow();
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 400, padding: 0.2 });
    }, 350);
    return () => clearTimeout(timer);
  }, [isSidebarOpen, fitView]);

  return null;
}

export default function DiagramCanvas() {
  const nodes            = useDiagramStore((s) => s.nodes);
  const edges            = useDiagramStore((s) => s.edges);
  const onNodesChange    = useDiagramStore((s) => s.onNodesChange);
  const onEdgesChange    = useDiagramStore((s) => s.onEdgesChange);
  const onConnect        = useDiagramStore((s) => s.onConnect);
  const setNodes         = useDiagramStore((s) => s.setNodes);
  const loadDiagram      = useDiagramStore((s) => s.loadDiagram);
  const setSelectedNodeId = useDiagramStore((s) => s.setSelectedNodeId);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const colorMode: ColorMode = 'dark';

  const { fitView, screenToFlowPosition }    = useReactFlow();
  const isLayouting    = useAppStore((s) => s.isLayouting);
  const setIsLayouting = useAppStore((s) => s.setIsLayouting);
  const rafRef         = useRef<number>(0);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);

  const duplicateNode    = useDiagramStore((s) => s.duplicateNode);
  const removeNode       = useDiagramStore((s) => s.removeNode);
  const addEmptyNode     = useDiagramStore((s) => s.addEmptyNode);
  const clearDiagram     = useDiagramStore((s) => s.clearDiagram);
  const selectedNodeId   = useDiagramStore((s) => s.selectedNodeId);

  /* ── Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if the user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'a') {
        addEmptyNode('umlClass', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
      }
      if (e.key.toLowerCase() === 'i') {
        addEmptyNode('umlInterface', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) removeNode(selectedNodeId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeId) duplicateNode(selectedNodeId);
      }
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (confirm('Clear entire diagram?')) clearDiagram();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, addEmptyNode, removeNode, duplicateNode, screenToFlowPosition, clearDiagram]);

  const handleExport = async (type: 'png' | 'svg') => {
    setIsExporting(true);
    try {
      if (type === 'png') await exportToPNG();
      else await exportToSVG();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAutoLayout = useCallback(async () => {
    if (isLayouting) return;
    setIsLayouting(true);
    try {
      const currentNodes = useDiagramStore.getState().nodes;
      const currentEdges = useDiagramStore.getState().edges;
      const layoutedNodes = await getLayoutedElements(currentNodes, currentEdges);

      const map: Record<string, { sx: number; sy: number; ex: number; ey: number }> = {};
      for (const node of currentNodes) {
        const target = layoutedNodes.find(n => n.id === node.id);
        map[node.id] = {
          sx: node.position.x, sy: node.position.y,
          ex: target?.position.x ?? node.position.x,
          ey: target?.position.y ?? node.position.y,
        };
      }

      const duration = 400;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        setNodes((cur: Node[]) => cur.map(node => {
          const d = map[node.id];
          if (!d) return node;
          return { ...node, position: { x: d.sx + (d.ex - d.sx) * eased, y: d.sy + (d.ey - d.sy) * eased } };
        }));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else { fitView({ duration: 400, padding: 0.15 }); setIsLayouting(false); }
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Layout failed:', err);
      setIsLayouting(false);
    }
  }, [isLayouting, setIsLayouting, fitView, setNodes]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div
      ref={wrapperRef}
      className={cn('h-full w-full relative', isLayouting && 'performance-mode')}
      style={{ background: 'var(--bg-primary)', zIndex: 'var(--z-canvas)' }}
    >
      {/*
       * SVG Marker Defs — UML Hollow Triangle Arrowhead
       * ─────────────────────────────────────────────────
       * One shared hollow-triangle marker used by both edge types.
       *
       * Geometry (in viewBox coords 0 0 12 10):
       *   • Triangle vertices: (0,0) → (12,5) → (0,10)
       *   • refX=12, refY=5  → tip of the triangle is the anchor point
       *   • The edge path terminates exactly at the triangle tip
       *
       * markerUnits="userSpaceOnUse":
       *   • markerWidth/Height are in canvas px, not multiples of stroke-width
       *   • Prevents React Flow's stroke-width from inflating marker size
       *
       * fill="var(--color-surface-950)" gives the hollow (background-color) centre.
       * stroke matches the edge stroke so the outline is continuous.
       */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'visible' }}>
        <defs>
          <marker
            id="uml-hollow-triangle"
            viewBox="0 0 12 10"
            refX="11"
            refY="5"
            markerWidth="12"
            markerHeight="10"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 12 5 L 0 10 Z"
              fill="var(--bg-primary)"
              stroke="var(--text-muted)"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </marker>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={!isLayouting}
        nodesConnectable={!isLayouting}
        elementsSelectable={!isLayouting}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
        }}
        onPaneContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setContextMenu(null);
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 1.5, stroke: 'var(--divider-color)' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <FlowAutoResizer />

        {/* ── Context Menu ── */}
        {contextMenu && (
          <div
            className="fixed z-[9999] bg-surface-950/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 160 }}
            onClick={() => setContextMenu(null)}
          >
            {contextMenu.nodeId ? (
              <>
                <ContextMenuItem icon={<Copy size={14} />} label="Duplicate" shortcut="Ctrl+D" onClick={() => duplicateNode(contextMenu.nodeId!)} />
                <ContextMenuItem icon={<Trash2 size={14} />} label="Delete" shortcut="Del" danger onClick={() => removeNode(contextMenu.nodeId!)} />
              </>
            ) : (
              <>
                <ContextMenuItem icon={<Plus size={14} />} label="New Class" shortcut="A" onClick={() => addEmptyNode('umlClass', screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y }))} />
                <ContextMenuItem icon={<Plus size={14} />} label="New Interface" shortcut="I" onClick={() => addEmptyNode('umlInterface', screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y }))} />
              </>
            )}
          </div>
        )}

        {/* ── Minimalist Empty State ── */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="max-w-xs text-center"
            >
              <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-cyan-500/5 flex items-center justify-center text-cyan-400/30 border border-cyan-500/10">
                <Layers size={20} strokeWidth={1.5} />
              </div>
              <h2 className="text-[13px] font-bold text-surface-50 mb-1.5 tracking-[0.05em] uppercase">Empty Workspace</h2>
              <p className="text-[11px] text-surface-500 font-medium">
                Start building your architecture.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── Floating Action Dock ──────────────────────────────
         *
         *  Token compliance:
         *  • height: --toolbar-height (48px)
         *  • icon buttons: 32×32px, --radius-md
         *  • group gap: --space-2 (8px)
         *  • group separator: 1px × 16px vertical line
         *  • bottom offset: --space-5 (20px)
         *  • z-index: --z-toolbar
         *  • hover: background fill 120ms, no scale
         *
         * ─────────────────────────────────────────────────── */}
        <Panel position="bottom-center" className="pointer-events-auto" style={{ bottom: 'var(--viewport-offset)', zIndex: 'var(--z-toolbar)' }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             'var(--space-2)',
              height:          'var(--toolbar-height)',
              paddingInline:   'var(--space-4)',
              borderRadius:    'var(--radius-2xl)',
              background:      'var(--panel-bg)',
              border:          'var(--panel-border)',
              backdropFilter:  'blur(var(--panel-blur))',
              boxShadow:       'var(--shadow-panel)',
            }}
          >
            {/* Group: Workspace Persistence */}
            <DockBtn onClick={() => saveToStorage(nodes, edges)} title="Save to browser">
              <Save size={15} />
            </DockBtn>
            <DockBtn
              onClick={() => {
                const saved = loadFromStorage();
                if (saved) loadDiagram(saved.nodes, saved.edges);
              }}
              title="Load from browser"
            >
              <FolderOpen size={15} />
            </DockBtn>

            <DockDivider />

            {/* Group: Auto Layout */}
            <DockBtn
              onClick={handleAutoLayout}
              disabled={isLayouting}
              active={isLayouting}
              title="Magic Auto Layout"
              wide
            >
              {isLayouting
                ? <Loader2 size={15} className="animate-spin" />
                : <Layout size={15} />
              }
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em', marginLeft: 4 }}>
                {isLayouting ? 'Arranging…' : 'Layout'}
              </span>
            </DockBtn>

            <DockDivider />

            {/* Group: Import / Export JSON */}
            <DockBtn
              onClick={() => {
                const json = serializeDiagram(nodes, edges);
                const blob = new Blob([json], { type: 'application/json' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url;
                a.download = `uml-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              title="Export JSON"
            >
              <DownloadCloud size={15} />
            </DockBtn>
            <DockBtn onClick={() => fileInputRef.current?.click()} title="Import JSON">
              <UploadCloud size={15} />
            </DockBtn>

            <DockDivider />

            {/* Group: Image export */}
            <DockBtn
              onClick={() => handleExport('png')}
              disabled={isExporting || nodes.length === 0}
              title="Export PNG"
            >
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>PNG</span>
            </DockBtn>
            <DockBtn
              onClick={() => handleExport('svg')}
              disabled={isExporting || nodes.length === 0}
              title="Export SVG"
            >
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>SVG</span>
            </DockBtn>

            <DockDivider />

            {/* Group: Destructive */}
            <DockBtn
              onClick={() => {
                if (confirm('Clear entire diagram?')) {
                  clearDiagram();
                }
              }}
              danger
              title="Clear canvas (Alt+C)"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </DockBtn>
          </motion.div>

          {/* Hidden file input */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                const data = deserializeDiagram(ev.target?.result as string);
                if (data) loadDiagram(data.nodes, data.edges);
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </Panel>

        {/* Background grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255, 255, 255, 0.03)"
        />

        {/* Inspector (right side) */}
        <InspectorPanel />



        {/* Zoom Controls */}
        <Controls
          showInteractive={false}
          style={{
            bottom:   'var(--viewport-offset)',
            left:     'var(--viewport-offset)',
            margin:   0,
          }}
        />
      </ReactFlow>
    </div>
  );
}

/* ── Dock Button ────────────────────────────────────────────── */

function DockBtn({
  children,
  disabled,
  active,
  danger,
  wide,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  wide?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.15,
        y: -4,
        backgroundColor: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)'
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center rounded-xl transition-colors select-none shrink-0",
        wide ? "px-4" : "w-10",
        "h-10",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
        danger ? "text-red-400 bg-red-400/5" : active ? "text-brand-400 bg-brand-500/10" : "text-surface-400 bg-transparent hover:text-surface-100"
      )}
    >
      {children}
    </motion.button>
  );
}

function DockDivider() {
  return (
    <div
      style={{
        width:      1,
        height:     20,
        background: 'rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
        marginInline: 'var(--space-1)',
      }}
    />
  );
}

/* ── Context Menu Item ── */

function ContextMenuItem({ icon, label, shortcut, danger, onClick }: { icon: React.ReactNode, label: string, shortcut?: string, danger?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 text-[13px] transition-colors",
        danger ? "text-red-400 hover:bg-red-400/10" : "text-surface-300 hover:bg-surface-800 hover:text-surface-100"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {shortcut && <span className="text-[10px] opacity-40 font-mono">{shortcut}</span>}
    </button>
  );
}

