/**
 * serialization.ts
 * ══════════════════════════════════════════════════════════════
 * Utilities for serializing and deserializing the React Flow graph.
 *
 * ── WHY ABSTRACTION? ──────────────────────────────────────────
 * Abstracting serialization away from the components ensures that
 * if we ever switch to a real backend database (or need to
 * implement format migrations for older JSON saves), the
 * conversion logic lives in one isolated, testable place.
 *
 * ── HOW REACT FLOW SERIALIZES ─────────────────────────────────
 * React Flow nodes and edges are already plain JavaScript objects
 * (POJOs) containing IDs, positions, and our custom `data` payloads.
 * Because we don't store functions or cyclical references inside
 * `data`, `JSON.stringify` works perfectly out of the box.
 * ══════════════════════════════════════════════════════════════
 */

import type { Node, Edge } from '@xyflow/react';

export interface SerializedDiagram {
  version: string;
  nodes: Node[];
  edges: Edge[];
}

/**
 * Serializes the current nodes and edges into a formatted JSON string.
 */
export function serializeDiagram(nodes: Node[], edges: Edge[]): string {
  const payload: SerializedDiagram = {
    version: '1.0',
    nodes,
    edges,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses a JSON string back into nodes and edges.
 * Includes basic validation to prevent corrupted files from crashing the app.
 */
export function deserializeDiagram(jsonString: string): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const parsed = JSON.parse(jsonString) as SerializedDiagram;

    // Basic structural validation
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');
    if (!Array.isArray(parsed.nodes)) throw new Error('Nodes must be an array');
    if (!Array.isArray(parsed.edges)) throw new Error('Edges must be an array');

    return {
      nodes: parsed.nodes,
      edges: parsed.edges,
    };
  } catch (error) {
    console.error('Failed to deserialize diagram:', error);
    return null;
  }
}
