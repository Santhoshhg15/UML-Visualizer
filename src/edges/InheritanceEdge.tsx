/**
 * InheritanceEdge.tsx
 * ══════════════════════════════════════════════════════════════
 * Custom React Flow edge for UML Inheritance (Extends).
 *
 * Hover visibility model:
 * ─────────────────────────────────────────────────────────────
 *  DEFAULT   → edge line visible, chevron badge HIDDEN
 *  HOVER     → edge line visible, chevron badge FADES IN
 *
 * How the hover is detected:
 *  A wide (20px) transparent <path> with pointerEvents='all' sits
 *  on top of the visible BaseEdge. This gives a generous hit area
 *  even for near-misses on thin lines. The `reveal` / `conceal`
 *  callbacks use a 150ms grace timer so moving the cursor from the
 *  SVG line into the HTML badge overlay doesn't cause a flicker.
 *
 * ══════════════════════════════════════════════════════════════
 */

import { BaseEdge, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import EdgeControls from './EdgeControls';

export default function InheritanceEdge({
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
    borderRadius: 0,
  });

  const reversed = Boolean((data as { reversed?: boolean } | undefined)?.reversed);

  /* ── Hover state shared between SVG hit-path and HTML badge ── */
  const [lineHovered, setLineHovered] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      {/* Visible UML Inheritance line — solid, hollow triangle */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={reversed ? undefined : 'url(#uml-hollow-triangle)'}
        markerEnd={reversed ? 'url(#uml-hollow-triangle)' : undefined}
        style={{
          ...style,
          strokeDasharray: 'none',
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
        edgeType="extends"
        reversed={reversed}
        isVisible={lineHovered}
        onEnter={reveal}
        onLeave={conceal}
      />
    </>
  );
}
