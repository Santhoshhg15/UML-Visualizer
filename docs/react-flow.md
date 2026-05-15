# React Flow Integration

The UML Visualizer is built on top of [React Flow](https://reactflow.dev/), a highly customizable library for building node-based applications.

## How React Flow Works Internally

React Flow maintains an internal coordinate system separate from the standard DOM pixel space. It renders nodes in a **DOM Layer** and edges in an **SVG Layer**, then uses CSS `transform: translate() scale()` to synchronize them as the user pans and zooms.

### Key Components

1. **The Viewport**: The visible area of the canvas. It is defined by an `x`, `y` (offset), and `zoom` level.
2. **Nodes**: Absolutely positioned `div` elements. We use `nodeTypes` to inject our custom `UMLNode` component.
3. **Edges**: SVG paths drawn between nodes. We use `edgeTypes` for UML inheritance and implementation arrows.
4. **Handles**: Invisible (or visible) connection points on nodes that define where edges attach.

## MiniMap & Viewport Synchronization

The MiniMap provides a zoomed-out view of the entire workspace. It works by:
1. **Sampling**: Reading the current `nodes` array from the Zustand store.
2. **Scaling**: Rendering a scaled-down version of all nodes into a small SVG or Canvas preview.
3. **Viewport Box**: Rendering a semi-transparent box (the "mask") that represents the current viewport's dimensions relative to the entire diagram.

### Synchronization Logic
- When the user pans the main canvas, React Flow updates the viewport state.
- The MiniMap listens to these changes and moves the "mask" box to match.
- Conversely, dragging the mask in the MiniMap updates the main viewport's `x` and `y` coordinates in the Zustand store.

## Edge Rendering & SVG Animations

UML relationships are rendered using a **Multi-Path Layering** strategy:

1. **Glow Layer**: A thick, low-opacity path that uses a blur filter and a pulse animation (`opacity` and `stroke-width`).
2. **Base Layer**: The standard UML compliant path (solid or dashed).
3. **Flow Layer**: A high-contrast, thin path with a short dash-array that animates its `stroke-dashoffset`.

### Why Subtle Motion?
Subtle motion improves the UX by:
- **Visual Direction**: Clearly indicating the hierarchy flow without needing large arrows.
- **System Feedback**: Making the canvas feel "alive" and responsive.
- **Contrast**: Helping relationships stand out against the static node-grid background.

### Performance Tip:
By using CSS animations (`@keyframes`) instead of JavaScript-based frame updates (like `requestAnimationFrame`), we offload the heavy lifting to the browser's GPU compositor, maintaining a smooth 60FPS even when multiple nodes are being dragged.

## Draggable Overlay Architecture

To create a premium editor feel, we use **Floating Overlays** (like the Inspector and MiniMap) instead of fixed sidebars.

### Implementation Pattern:
1. **React Flow Panels**: We use the `<Panel />` component to anchor elements to viewport corners (e.g., `bottom-right`).
2. **Framer Motion**: We wrap the panel content in a `<motion.div />`.
3. **Drag System**:
   - `drag`: Enables free movement.
   - `dragConstraints`: We pass a reference to the main canvas wrapper to prevent the panel from being dragged off-screen.
   - `dragMomentum={false}`: Ensures the panel stops exactly where the user releases it, providing a "heavy" professional tool feel.

## Performance Considerations

Rendering a complex UML diagram with hundreds of nodes can become expensive. We optimize performance by:

1. **Memoization**: Custom nodes and edges are wrapped in `React.memo` to prevent unnecessary re-renders when other parts of the graph change.
2. **Selector Subscriptions**: Using Zustand selectors (e.g., `useDiagramStore(s => s.nodes)`) ensures that only the components needing specific data are updated.
3. **CSS Hardware Acceleration**: We leverage GPU-accelerated properties like `transform` and `backdrop-filter` for smooth 60FPS dragging and animations.
4. **MiniMap Throttling**: The MiniMap is designed to be lightweight, rendering simplified boxes instead of full UML content to keep the frame rate high during rapid panning.

## Why Movable Workspace Tools?

Modern professional tools (Figma, Miro, Framer) prioritize **canvas real estate**. By making workspace tools movable and collapsible:
- Users can customize their environment based on the diagram's density.
- Large diagrams can be explored without UI elements covering important nodes.
- Large diagrams can be explored without UI elements covering important nodes.
- The interface feels like an "OS for diagrams" rather than a rigid website.

## Animated Node Repositioning

To achieve a "professional" feel during layout changes, we use **CSS Interpolation** instead of state-based tweening.

### Implementation:
- We attach a `transition: transform 0.6s cubic-bezier(...)` to the `.react-flow__node` class.
- When ELK.js calculates new coordinates and we update the Zustand store, React Flow updates the DOM `style.transform` of the node containers.
- The browser natively interpolates this change, creating a smooth "sliding" effect.

### Interaction Safety:
To prevent the animation from interfering with manual dragging (which would feel like "input lag"), we use the `.dragging` class injected by React Flow to instantly disable the transition while the user is actively moving a node.

## Performance Scaling & Interaction Smoothness

Modern graph editors must prioritize **Interaction Smoothness** over **Static Visuals**.

1. **State-Driven Animation**:
   - We avoid React Flow's built-in `animated` edges during layout movement to reduce the SVG calculation cost.
   - We use an `O(N)` pre-mapped state update loop to keep nodes and edges perfectly in sync without `O(N^2)` lookups.

2. **GPU Optimization (Performance Mode)**:
   - During `fitView` or `handleAutoLayout`, we disable `backdrop-filter` and `filter: blur()`.
   - This prevents the GPU from being overloaded by simultaneous pixel-shading and coordinate-transformation tasks.

3. **MiniMap Throttling**:
   - The MiniMap is simplified (grayscale + low opacity) during layout.
   - This ensures the browser's main thread is dedicated to the core layout animation.
