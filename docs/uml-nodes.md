# UML Nodes Architecture

React Flow allows us to render custom components as diagram nodes. In this project, `src/nodes/UMLNode.tsx` is the engine behind our UML diagrams.

## The `UMLNodeData` Interface

Every UML node requires a highly structured `data` payload to render correctly.

```typescript
export interface UMLMember {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface UMLNodeData extends Record<string, unknown> {
  className: string;
  stereotype?: string;
  attributes: UMLMember[];
  methods: UMLMember[];
  accentColor?: string;
}
```

## How Rendering Works

1. **Registration**: We map the string `umlClass` to the `UMLNode` component in `src/nodes/index.ts`.
2. **Injection**: When React Flow sees a node of type `umlClass`, it automatically mounts `<UMLNode>` and injects the `NodeProps` (which includes `data`, `selected`, `id`, etc.).
3. **Internal Styling**: The node parses `data.attributes` and `data.methods` to construct the standard 3-compartment UML box. If `selected` is true, we apply a neon CSS ring to signify active selection.

## Editing & Immutability

React Flow relies on strict immutability. If you mutate a node's data directly (`node.data.className = 'NewName'`), React Flow **will not re-render** the component.

To edit a node:
1. Call `updateNodeData(nodeId, { className: 'NewName' })` in the Zustand store.
2. The store maps over the `nodes` array.
3. When it finds the matching node, it creates a completely **new object reference**:
   `return { ...node, data: { ...node.data, ...partialData } }`
4. React Flow detects the reference change and forces `<UMLNode>` to re-render with the new data.

This architecture ensures high performance (only the edited node re-renders) and prevents nasty state bugs.
