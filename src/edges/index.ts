/**
 * edges/index.ts
 * ──────────────────────────────────────────────────
 * Barrel file for custom React Flow edge types.
 *
 * ── HOW EDGE REGISTRATION WORKS ──────────────────
 *
 * Similar to custom nodes, custom edges must be registered
 * in an `edgeTypes` object passed to <ReactFlow>.
 *
 * When React Flow encounters an edge with:
 *   `type: 'extends'`
 * It looks up `edgeTypes['extends']` and renders the
 * mapped component (InheritanceEdge).
 *
 * ⚠️  CRITICAL: This object MUST be defined outside the
 * component tree (module scope) to prevent React Flow
 * from unmounting/remounting all edges on every frame,
 * which destroys rendering performance.
 */

import type { EdgeTypes } from '@xyflow/react';
import InheritanceEdge from './InheritanceEdge';
import ImplementsEdge from './ImplementsEdge';

/**
 * Custom edge type registry.
 * Maps the relationship type string to the React component.
 */
export const edgeTypes: EdgeTypes = {
  extends: InheritanceEdge,
  implements: ImplementsEdge,
};

/* Re-export for direct usage if needed */
export { default as InheritanceEdge } from './InheritanceEdge';
export { default as ImplementsEdge } from './ImplementsEdge';
