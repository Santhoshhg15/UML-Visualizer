/**
 * persistence.ts
 * ══════════════════════════════════════════════════════════════
 * Utilities for reading and writing data to storage.
 * Currently uses localStorage, but the API is designed to easily
 * support async/await backend calls in the future.
 * ══════════════════════════════════════════════════════════════
 */

import type { Node, Edge } from '@xyflow/react';
import { serializeDiagram, deserializeDiagram } from './serialization';

// Bumped to v2 to invalidate stale saves that had backward UML edges.
const STORAGE_KEY = 'uml-visualizer-save-v2';

/**
 * Saves the current diagram state to local storage.
 */
export function saveToStorage(nodes: Node[], edges: Edge[]): void {
  try {
    const json = serializeDiagram(nodes, edges);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save diagram to storage:', error);
  }
}

/**
 * Loads the diagram state from local storage.
 * Returns null if no save exists or if parsing fails.
 */
export function loadFromStorage(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return deserializeDiagram(json);
  } catch (error) {
    console.error('Failed to load diagram from storage:', error);
    return null;
  }
}
