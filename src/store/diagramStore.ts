/**
 * diagramStore.ts
 * ──────────────────────────────────────────────────
 * Zustand store for React Flow diagram state.
 *
 * Manages nodes, edges, and viewport interactions.
 * ELK.js layout logic will hook into this store when
 * UML features are implemented.
 */

import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { loadFromStorage, saveToStorage } from '@/utils/persistence';
import type { UMLNodeData, UMLMember } from '@/nodes';

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  addRelationship: (sourceId: string, targetId: string, type: 'extends' | 'implements') => void;
  
  /* ── Cleanup Actions ── */
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  swapEdgeDirection: (edgeId: string) => void;
  clearDiagram: () => void;

  /* ── Selection & Editing ── */
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<UMLNodeData>) => void;
  duplicateNode: (id: string) => void;
  addEmptyNode: (type: 'umlClass' | 'umlInterface' | 'umlAbstract', position?: { x: number; y: number }) => void;
  addMember: (nodeId: string, memberType: 'attributes' | 'methods') => void;

  /* ── Persistence Actions ── */
  loadDiagram: (nodes: Node[], edges: Edge[]) => void;
}

// Hydrate initial state from localStorage if it exists
const initialData = loadFromStorage();

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: initialData?.nodes || [],
  edges: initialData?.edges || [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    /*
     * Smart edge-type inference:
     *
     * UML rule: if either endpoint is an interface, the relationship
     * is a Realization (implements). Class → Class is Inheritance (extends).
     *
     * We check `data.stereotype === 'interface'` on both the source and
     * target nodes to pick the correct edge type automatically.
     * The user can still flip direction using the mid-edge chevron badge.
     */
    const nodes = get().nodes;
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    const isInterface = (n: typeof sourceNode) =>
      (n?.data as { stereotype?: string } | undefined)?.stereotype === 'interface';

    const edgeType: 'extends' | 'implements' =
      isInterface(sourceNode) || isInterface(targetNode) ? 'implements' : 'extends';

    set({ edges: addEdge({ ...connection, type: edgeType }, get().edges) });
  },

  setNodes: (nodes) => set((state) => ({ 
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
  })),
  setEdges: (edges) => set((state) => ({ 
    edges: typeof edges === 'function' ? edges(state.edges) : edges 
  })),
  
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  
  addRelationship: (sourceId, targetId, type) => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type,
    };
    set({ edges: [...get().edges, newEdge] });
  },

  /* ── Selection & Editing ── */
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          // Creating a new object ensures React Flow triggers a re-render
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
    });
  },

  duplicateNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;

    const newNode: Node = {
      ...node,
      id: `node-${Date.now()}`,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      selected: true,
    };

    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), newNode],
      selectedNodeId: newNode.id,
    });
  },

  addEmptyNode: (type, position) => {
    const id = `node-${Date.now()}`;
    const defaultPosition = position || { x: 100, y: 100 };
    
    const stereotype = type === 'umlInterface' ? 'interface' : type === 'umlAbstract' ? 'abstract' : undefined;
    const className = type === 'umlInterface' ? 'INewInterface' : type === 'umlAbstract' ? 'NewAbstractClass' : 'NewClass';

    const newNode: Node = {
      id,
      type: 'umlClass', // We use 'umlClass' as the base type for all UML boxes
      position: defaultPosition,
      data: {
        className,
        stereotype,
        attributes: [],
        methods: [],
      } satisfies UMLNodeData,
      selected: true,
    };

    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), newNode],
      selectedNodeId: id,
    });
  },

  addMember: (nodeId, memberType) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        const data = node.data as UMLNodeData;
        const newMember: UMLMember = {
          visibility: '+',
          name: memberType === 'attributes' ? 'newProperty' : 'newMethod()',
          type: 'void',
        };
        return {
          ...node,
          data: {
            ...data,
            [memberType]: [...data[memberType], newMember],
          },
        };
      }
      return node;
    });
    set({ nodes });
  },

  /*
   * removeNode:
   * When a node is deleted, we MUST remove all edges that were connected to it.
   * If we don't, React Flow will crash or attempt to render "floating" edges
   * to non-existent DOM elements.
   */
  removeNode: (nodeId) => set({
    nodes: get().nodes.filter((n) => n.id !== nodeId),
    edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  }),

  removeEdge: (edgeId) => set({
    edges: get().edges.filter((e) => e.id !== edgeId),
  }),
  
  swapEdgeDirection: (edgeId) => set({
    edges: get().edges.map((e) => {
      if (e.id !== edgeId) return e;
      /*
       * CORRECT BEHAVIOUR:
       * Do NOT rewire the connection (source ↔ target swap changes the
       * routing path and is confusing). Instead, toggle a `reversed` flag
       * inside edge.data. The edge component reads this to decide whether
       * to place the hollow-triangle marker at the END (default) or
       * the START (reversed), giving a purely visual arrowhead flip while
       * the underlying node connection stays identical.
       */
      const d = (e.data ?? {}) as Record<string, unknown>;
      return { ...e, data: { ...d, reversed: !d.reversed } };
    }),
  }),

  clearDiagram: () => set({ nodes: [], edges: [], selectedNodeId: null }),

  loadDiagram: (nodes, edges) => set({ nodes, edges }),
}));

/**
 * ── ZUSTAND AUTO-SAVE SUBSCRIPTION ──
 * We listen for any changes to the graph state and serialize it to localStorage.
 * 
 * WHY DEBOUNCE?
 * React Flow updates the node `position` rapidly (60 times a second) when dragging.
 * If we serialized and hit localStorage on every frame, the app would stutter.
 * The 500ms timeout ensures we only save once the user stops moving things.
 */
let saveTimeout: ReturnType<typeof setTimeout>;
useDiagramStore.subscribe((state, prevState) => {
  if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveToStorage(state.nodes, state.edges);
    }, 500);
  }
});
