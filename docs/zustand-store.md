# Zustand State Management

The application state is globally managed via a single Zustand store located in `src/store/diagramStore.ts`. 

## Why Zustand?

React Flow provides built-in hooks (`useNodesState`), but they bind state tightly to the component where they are declared. In a complex app like ours, the Sidebar (which is outside the React Flow component tree) needs to add nodes, add relationships, and clear the playground. Zustand provides a global, reactive "slice" of state that any component can read or write to without prop-drilling.

## DiagramStore Interface

```typescript
interface DiagramState {
  // The raw graph data
  nodes: Node[];
  edges: Edge[];
  
  // React Flow internal handlers (for drag, drop, connect)
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  // Explicit setters
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  
  // Semantic actions
  addNode: (node: Node) => void;
  addRelationship: (sourceId: string, targetId: string, type: string) => void;
  
  // Cleanup actions
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  clearDiagram: () => void;

  // Persistence
  loadDiagram: (nodes: Node[], edges: Edge[]) => void;
}
```

## Immutable Cleanup Logic

Zustand requires an immutable update pattern to trigger React re-renders. When cleaning up the graph, we must ensure we don't mutate existing arrays.

**The `removeNode` cascade**:
```typescript
removeNode: (nodeId) => set({
  // 1. Filter out the node
  nodes: get().nodes.filter((n) => n.id !== nodeId),
  // 2. Garbage collect connected edges
  edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
})
```
By sweeping the edges in the same immutable `set()` call, we guarantee that React Flow receives a perfectly synchronized, consistent graph on the next render frame.

## Auto-Save Subscription (Persistence)

To provide an automatic auto-save feature without causing the app to stutter, we avoid calling `localStorage` inside the `onNodesChange` handlers. Instead, we use Zustand's native `subscribe()` method outside of the React lifecycle:

```typescript
let saveTimeout: ReturnType<typeof setTimeout>;
useDiagramStore.subscribe((state, prevState) => {
  if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveToStorage(state.nodes, state.edges);
    }, 500); // 500ms debounce
  }
});
```

**Why debounce?** React Flow rapidly fires state changes (60fps) when a user drags a node across the canvas to update its X/Y coordinates. Without the 500ms timeout, the app would attempt to serialize and synchronously write to disk 60 times a second, causing severe UI jank.

## Live Editing & Node Selection

To enable the Inspector Panel workflow without prop-drilling or complex local state, `diagramStore` handles global selection tracking:

```typescript
selectedNodeId: string | null;
setSelectedNodeId: (id: string | null) => void;
updateNodeData: (id: string, data: Partial<UMLNodeData>) => void;
```

When `updateNodeData` is called, we immutably clone the targeted node and spread the new `partialData` into its `data` property. Because the root `nodes` array receives a new array reference, and the targeted node receives a new object reference, React Flow perfectly synchronizes the canvas state in real-time, delivering 60FPS typing latency.
