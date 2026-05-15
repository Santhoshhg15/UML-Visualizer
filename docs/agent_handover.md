# 🌌 Project Handover: UML Diagram Visualizer

This document provides a comprehensive technical overview of the **UML Diagram Visualizer** project for onboarding and context synchronization.

---

## 🎯 Project Vision
A "Visual-First" engineering workspace designed for architecting complex UML class structures with a premium, high-performance interface. The goal is to replace form-driven data entry with **direct manipulation** on a high-fidelity canvas.

---

## 🛠️ Technical Core Stack
- **Framework**: React 19 (TypeScript)
- **Graph Engine**: [React Flow (v12)](https://reactflow.dev/) - Handles canvas, coordinates, and node/edge lifecycle.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Single source of truth in `src/store/diagramStore.ts`.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utilizes a strict **token-based system** (`src/styles/tokens.css`).
- **Layout Engine**: [ELK.js](https://github.com/kieler/elkjs) - Powering the "Auto-Layout" feature with layered hierarchical algorithms.
- **Animation**: Framer Motion & native `requestAnimationFrame` for high-performance position interpolation.

---

## 🧬 Architectural Achievements

### 1. Unified State & Immutable Cleanup
The project moved away from local component state to a centralized **Zustand store**. 
- **Achievement**: Implemented "cascade deletion" where removing a node automatically sweeps all connected edges in a single immutable update, preventing graph desync.
- **Persistence**: Debounced (500ms) auto-save to `localStorage` using Zustand's `subscribe` pattern to ensure 60FPS canvas performance during drag operations.

### 2. High-Precision Edge Rendering
- **SVG Marker Philosophy**: Relationship arrows (Inheritance, Realization) are rendered using SVG `<marker>` elements for perfect mathematical anchoring and auto-orientation.
- **Hollow Arrow Fix**: Solved the "line bleed-through" issue by using a solid background fill (matching the canvas) for the hollow inheritance triangles.
- **Quiet Controls**: Relationship management buttons (delete/swap) are hidden by default and reveal via hover-triggered translucent pills.

### 3. Custom UML Node Anatomy
- **3-Compartment Layout**: specialized `UMLNode` component rendering:
    1. **Header**: Name & Stereotype.
    2. **Attributes**: Typed list with visibility icons (`+`, `-`, `#`, `~`).
    3. **Methods**: Parameterized list with abstract/static styling.
- **Dynamic Sizing**: Nodes use `ResizeObserver` patterns to automatically adjust their height as attributes or methods are added.

### 4. Interactive UX Patterns
- **Double-Click Inline Editing**: Direct text-to-input swapping for immediate renaming and property updates.
- **Selection Toolbars**: Context-aware overlays that appear directly above selected nodes for quick actions (duplicate, delete, add property).
- **Keyboard-First Design**: Shortcuts for core primitives: `A` (Add Node), `I` (Inherit), `D` (Delete selected).

---

## 📂 Project Structure
```bash
src/
 ├── components/       # Layouts, Sidebar, Toolbar, and Glass panels
 ├── nodes/            # Custom React Flow Node components (UMLNode.tsx)
 ├── edges/            # Custom Edge types (InheritanceEdge, ImplementsEdge)
 ├── store/            # diagramStore.ts (Logic & State)
 ├── styles/           # tokens.css (Design System) & global overrides
 ├── utils/            # elk.ts (Auto-layout logic) & helpers
 └── docs/             # Specialized MD files for every architectural layer
```

---

## 💡 Key Technical Constraints
- **Token Discipline**: Do NOT use hardcoded spacing/colors. Always reference `var(--token-name)` from `tokens.css`.
- **State Integrity**: All diagram updates must pass through `diagramStore.ts`. Avoid `useState` for anything that affects the graph topology.
- **Performance**: During auto-layout, the app enters `.performance-mode`, stripping `backdrop-filter` and `box-shadow` to maintain 60FPS animation.

---

## 🚀 Current Focus & Roadmap
- [x] Standardize inheritance arrow rendering.
- [x] Implement contextual selection toolbars.
- [x] Refine landing page and onboarding flow.
- [ ] **Next**: Multi-node selection and group movement.
- [ ] **Next**: Export to PlantUML / Mermaid syntax.
- [ ] **Next**: Real-time collaboration hooks (WebSockets/Yjs).

---

*This documentation is generated for AI-to-AI context synchronization. Refer to `docs/` folder for deep dives into specific subsystems.*
