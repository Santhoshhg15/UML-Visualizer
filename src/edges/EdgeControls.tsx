/**
 * EdgeControls.tsx
 * ══════════════════════════════════════════════════════════════
 * Shared mid-edge control widget (InheritanceEdge + ImplementsEdge).
 *
 * Visibility contract:
 * ─────────────────────────────────────────────────────────────
 *  isVisible=false  → entire widget is opacity:0, pointerEvents:none
 *  isVisible=true   → widget fades in (180ms ease)
 *
 * isVisible is driven by `lineHovered` in the parent edge component,
 * which is set by a wide transparent SVG hit-path. The `onEnter` /
 * `onLeave` callbacks keep the badge visible while the cursor moves
 * from the SVG line into this HTML overlay (via a 150ms grace timer).
 *
 * Within the visible widget, `widgetHovered` tracks sub-hover to:
 *  • Apply the blue glow ring on the chevron badge
 *  • Fade in the delete button below the badge
 *
 * ══════════════════════════════════════════════════════════════
 */

import { EdgeLabelRenderer } from '@xyflow/react';
import { useDiagramStore } from '@/store';
import { Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface EdgeControlsProps {
  id: string;
  labelX: number;
  labelY: number;
  edgeType: 'extends' | 'implements' | 'dependency';
  /** true = arrowhead at source end (visually reversed) */
  reversed: boolean;
  /** Driven by parent edge's lineHovered state */
  isVisible: boolean;
  /** Called when cursor enters this widget — keeps grace timer alive */
  onEnter: () => void;
  /** Called when cursor leaves this widget — starts grace timer */
  onLeave: () => void;
}

export default function EdgeControls({
  id,
  labelX,
  labelY,
  edgeType,
  reversed,
  isVisible,
  onEnter,
  onLeave,
}: EdgeControlsProps) {
  const removeEdge    = useDiagramStore((s) => s.removeEdge);
  const swapDirection = useDiagramStore((s) => s.swapEdgeDirection);

  /* Sub-hover: glows the badge and reveals the delete button */
  const [widgetHovered, setWidgetHovered] = useState(false);

  const handleSwap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    swapDirection(id);
  }, [id, swapDirection]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeEdge(id);
  }, [id, removeEdge]);

  const relationLabel = edgeType === 'extends' ? 'Inheritance' : edgeType === 'implements' ? 'Realization' : 'Dependency';
  const chevronDeg    = reversed ? 180 : 0;

  return (
    <EdgeLabelRenderer>
      {/*
       * Outer wrapper:
       *  • opacity / transform driven by isVisible (edge line hover)
       *  • onMouseEnter fires onEnter() to keep the grace timer alive
       *    while cursor moves from SVG → HTML overlay
       *  • Sub-hover (widgetHovered) drives the glow + delete reveal
       */}
      <div
        style={{
          position:  'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          display:   'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          zIndex: 10,
          padding: '2px 4px',
          /* Visibility: driven entirely by isVisible prop */
          opacity:       isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'all' : 'none',
          transition:    'opacity 180ms ease',
        }}
        className="nodrag nopan"
        onMouseEnter={() => {
          onEnter();           /* keep grace timer alive               */
          setWidgetHovered(true);
        }}
        onMouseLeave={() => {
          onLeave();           /* start grace timer (edge component decides) */
          setWidgetHovered(false);
        }}
      >

        {/* ── Direction Chevron Badge ─────────────────────────── */}
        <button
          onClick={handleSwap}
          title={`Flip ${relationLabel} arrowhead direction`}
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           20,
            height:          20,
            borderRadius:    '50%',
            border:          widgetHovered
              ? '1.5px solid var(--color-brand-400)'
              : '1.5px solid var(--color-surface-600)',
            background:      widgetHovered
              ? 'color-mix(in srgb, var(--color-brand-600) 25%, var(--color-surface-900))'
              : 'var(--color-surface-900)',
            backdropFilter:  'blur(8px)',
            cursor:          'pointer',
            padding:         0,
            outline:         'none',
            boxShadow:       widgetHovered
              ? '0 0 0 4px color-mix(in srgb, var(--color-brand-500) 25%, transparent), 0 2px 8px rgba(0,0,0,0.6)'
              : '0 1px 6px rgba(0,0,0,0.5)',
            transition: 'border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{
              transform:  `rotate(${chevronDeg}deg)`,
              transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              display:    'block',
            }}
          >
            <path
              d="M 3 2 L 7 5 L 3 8"
              stroke={widgetHovered ? 'var(--color-brand-300)' : 'var(--color-surface-400)'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 160ms ease' }}
            />
          </svg>
        </button>

        {/* ── Delete Button — visible only on sub-hover ────────── */}
        <button
          onClick={handleDelete}
          title="Remove relationship"
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           18,
            height:          18,
            borderRadius:    '50%',
            border:          '1px solid transparent',
            background:      'transparent',
            cursor:          'pointer',
            padding:         0,
            outline:         'none',
            opacity:         widgetHovered ? 1 : 0,
            transform:       widgetHovered ? 'scale(1)' : 'scale(0.6)',
            pointerEvents:   widgetHovered ? 'auto' : 'none',
            transition:      'opacity 160ms ease, transform 160ms ease, background 120ms ease, border-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background  = 'color-mix(in srgb, #ef4444 18%, var(--color-surface-900))';
            e.currentTarget.style.borderColor = '#ef444455';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Trash2 size={10} color="#ef4444" />
        </button>

      </div>
    </EdgeLabelRenderer>
  );
}
