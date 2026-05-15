# UML Relationship Management

The UML Visualizer supports dynamic creation and styling of standard UML relationships. Relationships are represented as edges in the React Flow graph.

## Current Supported Relationships

| Type | UML Semantic | Visual Styling | React Component |
|------|--------------|----------------|-----------------|
| **Extends** | Inheritance (A class is derived from another) | Solid line, hollow triangular arrowhead | `<InheritanceEdge>` |
| **Implements** | Realization (A class implements an interface) | Dashed line, hollow triangular arrowhead | `<ImplementsEdge>` |

## Premium Animated Visuals

To enhance the "Live Editor" experience, UML relationships feature subtle, futuristic animations:

- **Inheritance (Extends)**: Features a solid line with an ambient pulse glow. A high-frequency "flow" path animates toward the parent class, representing the flow of inherited properties.
- **Realization (Implements)**: Features a dashed line with a success-green glow. The dashed segments animate continuously, visually distinguishing it from static inheritance lines.

These animations are implemented using CSS `stroke-dashoffset` keyframes, ensuring high performance (60FPS) even with complex diagrams.

## Relationship Deletion Flow

Edge deletion is handled via a custom UI overlay:
1. We utilize React Flow's `<EdgeLabelRenderer>` component inside our custom edge definitions.
2. The renderer creates a DOM portal layer sitting cleanly above the SVG `<path>` elements.
3. We calculate the exact midpoint of the edge using `getSmoothStepPath` returns (`labelX`, `labelY`).
4. An interactive 'X' button is placed at this midpoint. When clicked, it dispatches `removeEdge(id)` to the global store, cleanly destroying the relationship without affecting the source or target nodes.

## Future Expansion
The system is built to be extensible. To add new relationships (like Association, Aggregation, or Composition):
1. Create a new Edge component in `src/edges/`.
2. Register it in `src/edges/index.ts`.
3. Add the type to the `<select>` options in `Sidebar.tsx`.

## UML Semantics in React Flow

In UML, relationships have directionality (Source → Target). 
- **Source**: The child class (e.g., `Admin`).
- **Target**: The parent class or interface (e.g., `User`).

React Flow models this perfectly with `source` and `target` handles. The arrowhead is always drawn at the `target` end.

## Troubleshooting

- **Edge isn't showing up**: Ensure both the source and target node IDs exist in the store. An edge with a missing endpoint will not render in React Flow.
- **Edges disappear randomly**: This is expected behavior if you deleted the source or target node! The system automatically cleans up orphaned edges to prevent crashes.
- **Can't click the delete edge button**: The `<EdgeLabelRenderer>` parent div must have `pointer-events: all` assigned to it, otherwise DOM clicks will fall through to the canvas panning layer.
