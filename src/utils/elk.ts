/**
 * elk.ts
 * ──────────────────────────────────────────────────
 * ELK.js auto‑layout utility.
 *
 * Provides a helper function that takes React Flow nodes
 * & edges, runs them through ELK's layered algorithm,
 * and returns repositioned nodes.  Call this whenever the
 * user requests an automatic layout.
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

/** Default ELK layout options (top‑to‑bottom hierarchy, padded) */
const DEFAULT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  /*
   * ── WHY DIRECTION IS 'DOWN' ───────────────────────
   *
   * ELK 'direction' controls where SOURCES are placed relative to TARGETS.
   *   DOWN → sources at top, targets at bottom
   *
   * After the generator's source/target swap:
   *   RF source = parent,  RF target = child
   *
   * So DOWN places parents at the top and children at the bottom,
   * giving the standard UML reading order:
   *
   *        [Animal]     ← source (parent, top)
   *           △
   *           │
   *        [Tiger]      ← target (child, bottom)
   */
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '140',
  'elk.spacing.component': '150',
  'elk.padding': '[top=100,left=100,bottom=100,right=100]',
  /*
   * Preserve the declaration order of classes within each layer.
   * Without this, ELK may reorder siblings arbitrarily, causing
   * interfaces to drift away from their implementing classes.
   */
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
};

/**
 * Run the ELK layout engine on the given nodes and edges.
 *
 * @returns A new array of nodes with updated `position` values.
 */
export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: Record<string, string> = {},
): Promise<Node[]> {
  const layoutOptions = { ...DEFAULT_OPTIONS, ...options };

  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: node.measured?.width ?? 200,
      height: node.measured?.height ?? 100,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  return nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    if (!layoutedNode) return node;

    return {
      ...node,
      position: {
        x: layoutedNode.x ?? 0,
        y: layoutedNode.y ?? 0,
      },
    };
  });
}
