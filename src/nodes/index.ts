/**
 * nodes/index.ts
 * ──────────────────────────────────────────────────
 * Custom React Flow node type registry.
 *
 * ── HOW NODE REGISTRATION WORKS ──────────────────
 *
 * React Flow renders nodes by looking up their `type`
 * string in the `nodeTypes` object passed to <ReactFlow>.
 *
 *   1. You define a node: { id: '1', type: 'umlClass', data: {…} }
 *   2. React Flow looks up `nodeTypes['umlClass']`
 *   3. It renders that component, injecting `NodeProps`
 *
 * ⚠️  CRITICAL: This object MUST be defined outside the
 * component tree (at module scope).  If you create it
 * inside a component, React Flow will get a new object
 * reference on every render, causing all nodes to
 * unmount → remount on each frame.  This destroys
 * performance and breaks internal state (selections,
 * drag positions, etc.).
 *
 * Re‑export individual node components for direct use.
 */

import type { NodeTypes } from '@xyflow/react';
import UMLNode from './UMLNode';

/**
 * Maps node `type` strings to React components.
 *
 * When React Flow encounters a node with `type: 'umlClass'`,
 * it renders the `UMLNode` component and injects the node's
 * `data` payload as props.
 */
export const nodeTypes: NodeTypes = {
  umlClass: UMLNode,
};

/* Re‑export node components and types */
export { default as UMLNode } from './UMLNode';
export type { UMLNodeData, UMLMember } from './UMLNode';
