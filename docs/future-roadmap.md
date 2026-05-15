# Future Roadmap

The UML Visualizer architecture is highly modular and extensible. Below are the planned future capabilities categorized by complexity.

## ✅ Phase 1: Local Persistence (COMPLETED)
- **Status**: Implemented via custom utility layers (`persistence.ts`, `serialization.ts`) and debounced Zustand subscriptions.
- **Features**: Auto-save, manual save/load, Export JSON, Import JSON.

## ✅ Phase 5: Advanced Exports (COMPLETED)
- **Image Export**: Implemented using `html-to-image` via `exportDiagram.ts`. Captures the React Flow viewport and downloads it as a high-res 2x scaled PNG or a vectorized SVG. Filters out UI toolbars automatically.

## ✅ Phase 7: Workspace Navigation (COMPLETED)
- **Movable MiniMap**: Implemented a premium, draggable overview panel with glassmorphism styling and collapsible states. Improves UX for large-scale diagram navigation.

## Phase 2: Backend Cloud Sync
- **Implementation**: Hook the existing `persistence.ts` utility layer to a cloud backend (e.g., Firebase, Supabase) via async/await.
- **Goal**: Allow users to create accounts, save diagrams to the cloud, and share diagram URLs with collaborators.

## ✅ Phase 3: Auto-Layout Engine (ELK.js) (COMPLETED)
- **Implementation**: Integrated `elkjs` layout algorithms with a custom CSS-based animation system.
- **Features**: One-click hierarchical arrangement, animated node transitions, multi-graph support.

## Phase 4: Advanced UML Semantics
- **Multiplicity & Roles**: Update custom edges to support start/end labels (e.g., `1..*` or `owner`).
- **Composition / Aggregation**: Add new Edge component types featuring filled/hollow diamond SVG markers.
- **Inline Editing**: Allow double-clicking node attributes/methods to edit them directly on the canvas instead of via the Sidebar.

## Phase 6: Code Generation
- **Goal**: A parser that iterates over the `nodes` array and generates boilerplate TypeScript interfaces or Java classes based on the UML members.
