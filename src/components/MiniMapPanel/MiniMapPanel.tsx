/**
 * MiniMapPanel.tsx
 * ──────────────────────────────────────────────────
 * Ambient workspace position indicator.
 */

import { MiniMap } from '@xyflow/react';
import { Map, X } from 'lucide-react';
import { useAppStore } from '@/store';

interface MiniMapPanelProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function MiniMapPanel({ containerRef: _ }: MiniMapPanelProps) {
  const isMiniMapOpen = useAppStore((s) => s.isMiniMapOpen);
  const toggleMiniMap = useAppStore((s) => s.toggleMiniMap);
  const isLayouting   = useAppStore((s) => s.isLayouting);

  // We use fixed numbers for React Flow internal calculations to avoid NaN errors
  // these match the --minimap-width (160) and --minimap-height (110) tokens.
  const WIDTH = 160;
  const HEIGHT = 110;

  /* ── Collapsed state: tiny icon button ── */
  if (!isMiniMapOpen) {
    return (
      <button
        onClick={toggleMiniMap}
        title="Show overview"
        className="flex items-center justify-center rounded-lg border border-white/5 bg-surface-950/60 backdrop-blur-md text-surface-500 hover:text-surface-100 hover:bg-surface-800 transition-all duration-200"
        style={{
          width: 32,
          height: 32,
          zIndex: 'var(--z-minimap)',
        }}
      >
        <Map size={14} />
      </button>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-surface-950/60 backdrop-blur-xl shadow-panel transition-all duration-300"
      style={{
        width: WIDTH,
        borderRadius: 'var(--radius-xl)',
        border: 'var(--panel-border)',
        opacity: isLayouting ? 0.4 : 1,
        transform: isLayouting ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-3 bg-white/5 border-b border-white/5"
        style={{ height: 24 }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-surface-500 select-none">
          Overview
        </span>
        <button
          onClick={toggleMiniMap}
          disabled={isLayouting}
          className="flex items-center justify-center rounded-sm text-surface-600 hover:text-surface-100 transition-colors disabled:opacity-30"
          style={{ width: 18, height: 18 }}
        >
          <X size={11} />
        </button>
      </div>

      {/* MiniMap Content */}
      <div style={{ width: WIDTH, height: HEIGHT }}>
        <MiniMap
          nodeColor="var(--brand-primary)"
          maskColor="rgba(6, 8, 22, 0.75)"
          pannable={!isLayouting}
          zoomable={!isLayouting}
          style={{
            margin: 0,
            backgroundColor: 'transparent',
          }}
        />
      </div>
    </div>
  );
}
