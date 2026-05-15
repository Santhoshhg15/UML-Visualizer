/**
 * generateReactFlowDiagram.ts
 * ──────────────────────────────────────────────────
 * Converts a UMLDiagramSchema into React Flow nodes and edges.
 *
 * ── ARCHITECTURE BOUNDARY ─────────────────────────
 *
 * This module is the SOLE translation layer between the
 * abstract UML schema and the React Flow rendering system.
 *
 *   UMLDiagramSchema ──▶ generateReactFlowDiagram() ──▶ { nodes, edges }
 *
 * The parser produces a UI-agnostic schema.
 * The generator consumes that schema and emits React Flow primitives.
 * Neither knows about the other — the schema is the contract.
 *
 * ── WHY THIS SEPARATION MATTERS ───────────────────
 *
 * 1. Parser Independence
 *    The parser is a pure text→data function. It never imports
 *    React Flow types, never positions nodes, never chooses edge
 *    styles. This means the same parser can power:
 *      • React Flow rendering (this generator)
 *      • SVG export
 *      • Code generation
 *      • Server-side validation
 *    …without any coupling.
 *
 * 2. Future AI Systems
 *    When an LLM generates UML, it will output a UMLDiagramSchema
 *    (via structured output / function calling). The generator
 *    converts that schema to a visual diagram with zero changes
 *    to either the AI prompt or the rendering pipeline.
 *
 * 3. Code-to-UML Generation
 *    A future TypeScript/Java AST analyzer will emit the same
 *    UMLDiagramSchema. The generator renders it identically —
 *    the source of the schema is irrelevant.
 *
 * 4. Schema Abstraction
 *    The schema is the single source of truth. It decouples
 *    every input system (text, voice, AI, code) from every
 *    output system (canvas, export, codegen). Adding a new
 *    input requires only a new parser; adding a new output
 *    requires only a new generator. Neither invalidates the other.
 *
 * ── POSITIONING ───────────────────────────────────
 *
 * Nodes are placed on a simple diagonal grid:
 *   x = index * 300,  y = index * 150
 *
 * This is intentionally crude. ELK auto-layout will replace
 * these positions with a proper hierarchical layout once
 * integrated. The temporary positions ensure nodes don't
 * stack on top of each other in the meantime.
 *
 * ── EDGE DIRECTION (UML INHERITANCE RULE) ─────────
 *
 * In UML, inheritance arrows point FROM the child TO the parent:
 *
 *   Tiger ─────────▷ Animal
 *   (child)           (parent)
 *
 * The schema encodes this semantically as:
 *   source = child (Tiger),  target = parent (Animal)
 *
 * HOWEVER, the generator SWAPS source/target for React Flow:
 *   RF edge source = parent (Animal)  → uses source handle (Bottom)
 *   RF edge target = child  (Tiger)   → uses target handle (Top)
 *
 * This is necessary because the UMLNode component has:
 *   source handle at Position.Bottom (exit point, going down)
 *   target handle at Position.Top    (entry point, from above)
 *
 * So edges route naturally from parent's bottom → child's top.
 * The hollow triangle marker is placed at markerStart (parent end)
 * to point toward the parent, preserving correct UML semantics.
 */

import type { Node, Edge } from '@xyflow/react';
import type { UMLDiagramSchema } from '@/ai/schema';
import type { UMLNodeData, UMLMember } from '@/nodes';

/** The output contract of the generator. */
export interface ReactFlowDiagram {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Converts a UMLDiagramSchema into React Flow nodes and edges.
 *
 * @param schema — The parsed, UI-agnostic UML schema.
 * @returns An object containing React Flow–compatible `nodes` and `edges`.
 *
 * @example
 * ```ts
 * const schema = parseTextToUML(userInput);
 * const { nodes, edges } = generateReactFlowDiagram(schema);
 * setNodes(nodes);
 * setEdges(edges);
 * ```
 */
export function generateReactFlowDiagram(schema: UMLDiagramSchema): ReactFlowDiagram {
  const nodes = generateNodes(schema);
  const edges = generateEdges(schema);

  return { nodes, edges };
}

/* ── Internal Helpers ──────────────────────────────── */

/**
 * Maps each UMLClass to a React Flow node of type `umlClass`.
 *
 * The `data` payload is shaped as `UMLNodeData` to match
 * the existing UMLNode component's props contract:
 *
 *   className   → the class/interface name
 *   stereotype  → 'interface' | undefined (maps UMLClass.type)
 *   attributes  → UMLMember[] with visibility defaulting to '+'
 *   methods     → UMLMember[] with visibility defaulting to '+'
 *
 * ── POSITIONING ──────────────────────────────────────
 *
 * Nodes are positioned in a hierarchy-aware grid:
 *   • Root nodes (no parent) are placed at the top (y = 0)
 *   • Children are placed below their parents (y = depth * VERTICAL_GAP)
 *   • Siblings at the same depth are spread horizontally
 *
 * This is still temporary — ELK auto-layout will replace these
 * positions — but it ensures the diagram is immediately readable
 * with correct top-to-bottom hierarchy: Parent above Child.
 */
function generateNodes(schema: UMLDiagramSchema): Node[] {
  // Build a depth map: how deep each class is in the hierarchy.
  // Root classes (no parents) have depth 0, their children depth 1, etc.
  const depthMap = computeDepthMap(schema);

  // Group classes by depth for horizontal spreading
  const depthBuckets = new Map<number, number>();

  return schema.classes.map((umlClass) => {
    const depth = depthMap.get(umlClass.id) ?? 0;
    const siblingIndex = depthBuckets.get(depth) ?? 0;
    depthBuckets.set(depth, siblingIndex + 1);

    // Map UMLAttribute[] → UMLMember[]
    const attributes: UMLMember[] = umlClass.attributes.map((attr) => ({
      visibility: '+' as const,  // Default public; schema may add visibility later
      name: attr.name,
      type: attr.type,
    }));

    // Map UMLMethod[] → UMLMember[]
    const methods: UMLMember[] = umlClass.methods.map((method) => ({
      visibility: '+' as const,
      name: method.name + '()',  // Append parens for visual consistency
      type: method.returnType ?? 'void',
    }));

    // Map UMLClass.type → UMLNodeData.stereotype
    // 'class' → undefined (renders as «Class»)
    // 'interface' → 'interface' (renders as «interface»)
    const stereotype = umlClass.type === 'interface' ? 'interface' : undefined;

    const data: UMLNodeData = {
      className: umlClass.name,
      stereotype,
      attributes,
      methods,
    };

    const HORIZONTAL_GAP = 320;
    const VERTICAL_GAP = 250;

    const node: Node = {
      id: umlClass.id,
      type: 'umlClass',
      position: {
        x: siblingIndex * HORIZONTAL_GAP,
        y: depth * VERTICAL_GAP,
      },
      data,
    };

    return node;
  });
}

/**
 * Compute a depth map for the class hierarchy.
 *
 * Roots (classes with no parent in the relationship set)
 * are depth 0. Each extends/implements edge adds one level.
 *
 * UML hierarchy convention:
 *   depth 0 = interfaces / root classes (top of diagram)
 *   depth N = most derived classes (bottom of diagram)
 */
function computeDepthMap(schema: UMLDiagramSchema): Map<string, number> {
  // Build adjacency: parent → children[]
  const childrenOf = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const rel of schema.relationships) {
    // rel.source = child, rel.target = parent
    hasParent.add(rel.source);
    const kids = childrenOf.get(rel.target) ?? [];
    kids.push(rel.source);
    childrenOf.set(rel.target, kids);
  }

  // Find roots: classes that are never a source in a relationship
  // (i.e., they have no parent — they ARE the parent)
  const roots = schema.classes
    .filter((c) => !hasParent.has(c.id))
    .map((c) => c.id);

  // BFS from roots to assign depths
  const depthMap = new Map<string, number>();
  const queue = roots.map((id) => ({ id, depth: 0 }));

  // If there are no roots (circular refs), seed all classes at depth 0
  if (queue.length === 0) {
    for (const c of schema.classes) {
      queue.push({ id: c.id, depth: 0 });
    }
  }

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depthMap.has(id)) continue; // already visited (handles cycles)
    depthMap.set(id, depth);

    const children = childrenOf.get(id) ?? [];
    for (const childId of children) {
      if (!depthMap.has(childId)) {
        queue.push({ id: childId, depth: depth + 1 });
      }
    }
  }

  return depthMap;
}

/**
 * Maps each UMLRelationship to a React Flow edge.
 *
 * Edge type is carried through verbatim from the schema:
 *   'extends'    → InheritanceEdge (hollow triangle)
 *   'implements' → ImplementsEdge  (dashed + hollow triangle)
 *
 * ── SOURCE/TARGET SWAP ──────────────────────────────
 *
 * The schema uses semantic direction:
 *   source = child,  target = parent
 *
 * But React Flow edges must match the handle topology:
 *   source handle = Position.Bottom (parent, at top of diagram)
 *   target handle = Position.Top    (child, at bottom of diagram)
 *
 * So we SWAP: RF source = schema target (parent)
 *             RF target = schema source (child)
 *
 * This gives natural top-to-bottom edge routing:
 *   Parent (bottom handle) ──── → Child (top handle)
 *
 * The hollow triangle marker is placed at markerStart
 * (the parent end) in the edge components, so it still
 * points toward the parent per UML convention:
 *
 *        [Animal]
 *           △       ← markerStart (at parent)
 *           │
 *        [Tiger]
 */
function generateEdges(schema: UMLDiagramSchema): Edge[] {
  return schema.relationships.map((rel, index) => {
    const edge: Edge = {
      id: `edge-gen-${index}-${rel.source}-${rel.type}-${rel.target}`,
      source: rel.target,  // parent (top of diagram, source handle at bottom)
      target: rel.source,  // child  (bottom of diagram, target handle at top)
      type: rel.type,
    };

    return edge;
  });
}
