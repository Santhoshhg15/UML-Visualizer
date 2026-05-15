/**
 * ImplementsEdge.tsx
 * ══════════════════════════════════════════════════════════════
 * Custom React Flow edge for UML Interface Realization (Implements).
 *
 * Hover visibility model:
 * ─────────────────────────────────────────────────────────────
 *  DEFAULT   → dashed edge line visible, chevron badge HIDDEN
 *  HOVER     → dashed edge line visible, chevron badge FADES IN
 *
 * Same wide transparent hit-path technique as InheritanceEdge.
 * Auto-assigned when either endpoint is an interface node
 * (via diagramStore.onConnect stereotype detection).
 *
 * ══════════════════════════════════════════════════════════════
 */

import { BaseEdge, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import EdgeControls from './EdgeControls';

export default function ImplementsEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const reversed = Boolean((data as { reversed?: boolean } | undefined)?.reversed);

  /* ── Hover state shared between SVG hit-path and HTML badge ── */
  const [lineHovered, setLineHovered] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const reveal = useCallback(() => {
    clearTimeout(hideTimer.current);
    setLineHovered(true);
  }, []);

  const conceal = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setLineHovered(false), 150);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <>
      {/* Visible UML Realization line — dashed, hollow triangle */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={reversed ? undefined : 'url(#uml-hollow-triangle)'}
        markerEnd={reversed ? 'url(#uml-hollow-triangle)' : undefined}
        style={{
          ...style,
          strokeDasharray: '6 4',
          stroke: 'var(--color-surface-500)',
          strokeWidth: 1.5,
        }}
      />

      {/*
       * Wide transparent hit-path — same shape as the edge but 20px thick.
       * pointerEvents='all' makes it respond to mouse even with 0 opacity.
       * Must come AFTER BaseEdge so it sits on top in SVG z-order.
       */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ pointerEvents: 'all', cursor: 'default' }}
        onMouseEnter={reveal}
        onMouseLeave={conceal}
      />

      <EdgeControls
        id={id}
        labelX={labelX}
        labelY={labelY}
        edgeType="implements"
        reversed={reversed}
        isVisible={lineHovered}
        onEnter={reveal}
        onLeave={conceal}
      />
    </>
  );
}
