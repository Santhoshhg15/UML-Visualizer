import { BaseEdge, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import EdgeControls from './EdgeControls';

export default function DependencyEdge({
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
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={reversed ? undefined : 'url(#uml-dependency-arrow)'}
        markerEnd={reversed ? 'url(#uml-dependency-arrow)' : undefined}
        style={{
          ...style,
          strokeDasharray: '4 4',
          stroke: 'var(--color-surface-500)',
          strokeWidth: 1.5,
        }}
      />

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
        edgeType="dependency"
        reversed={reversed}
        isVisible={lineHovered}
        onEnter={reveal}
        onLeave={conceal}
      />
    </>
  );
}
