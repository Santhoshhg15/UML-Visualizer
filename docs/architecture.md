# Architecture — UML Canvas

## Overview

The UML Visualizer is a structured engineering workspace with four architectural layers:

1. **View Layer** (React + Tailwind) — components consume design tokens from `src/styles/tokens.css`
2. **Graph Engine** (React Flow) — canvas, coordinate math, hit detection, viewport
3. **State** (Zustand) — single source of truth for diagram topology and UI state
4. **Utilities** — ELK.js layout, serialization, persistence, export

---

## Token System

All layout values live in `src/styles/tokens.css` and are imported globally via `src/styles/index.css`.

**File structure:**
```
src/styles/
  tokens.css    ← Design tokens (spacing, sizing, z-index, typography)
  index.css     ← Imports tokens.css + global CSS + React Flow overrides
```

**No component may use hardcoded spacing/sizing/z-index values.** All must reference `var(--token-name)`.

---

## Panel Z-Index Hierarchy

```
z=40  Tooltips
z=30  Overlays (confirm dialogs)
z=20  Header + Floating Toolbar (above panels)
z=15  Minimap
z=10  Sidebar + Inspector (workspace panels)
z=0   Canvas (baseline)
```

---

## Component Sizing Reference

| Component | Width | Height | Token |
|---|---|---|---|
| Sidebar | 240px | 100% | `--sidebar-width` |
| Inspector | 260px | ≤ viewport | `--inspector-width` |
| Toolbar | auto | 48px | `--toolbar-height` |
| Minimap | 160px | 110px | `--minimap-width/height` |
| Header | 100% | 52px | `--header-height` |

---

## Toolbar Grouping Logic

The toolbar organizes actions into semantic groups separated by 1px×16px dividers:

```
[ Save ] [ Load ] | [ Layout ] | [ Export JSON ] [ Import JSON ] | [ PNG ] [ SVG ] | [ Clear ]
```

Group intent:
1. **Persistence** — browser-storage save/load
2. **Layout** — ELK.js auto-arrangement
3. **File I/O** — JSON import/export
4. **Image export** — PNG/SVG render
5. **Destructive** — clear canvas (danger state)

---

## Scroll Ergonomics

All panel scroll containers apply the `.panel-scroll` class:
```css
.panel-scroll {
  overflow-y: auto;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}
```

Custom scrollbar: 4px wide, transparent track, `rgba(255,255,255,0.12)` thumb.

Overflow fade: `.panel-scroll-fade::after` gradient signal for continued content.

---

## UML Graph Architecture

### Node Modeling
- Custom nodes: `UMLNode.tsx` — 3-compartment class box (header, attributes, methods)
- Editing via Inspector Pattern — selecting a node opens `InspectorPanel`, not inline editing
- Zustand creates new object references on every field update — React Flow re-renders only the changed node

### Relationship Architecture
- Two custom edge types: `InheritanceEdge` (solid, hollow triangle) and `ImplementsEdge` (dashed)
- SVG markers defined once in `<defs>` block inside `DiagramCanvas.tsx`
- Node deletion triggers automatic edge garbage collection in `diagramStore.ts`

### Auto-Layout (ELK.js)
- Layout computed by `src/utils/elk.ts` using the layered hierarchical algorithm
- Positions interpolated over 400ms via raw `requestAnimationFrame` — no animation libraries
- `fitView()` called **after** animation completes to prevent competing viewport transforms
- `.performance-mode` class applied during layout — strips `backdrop-filter` and `box-shadow` from all elements for 60FPS position interpolation

### Inline Editing Logic
- Nodes implement local state for field editing (`editingField`).
- Text is swapped for styled `<input>` elements on double-click.
- Keyboard events (`Enter`, `Esc`) and `onBlur` trigger the `updateNodeData` store action.
- Member parsing logic (visibility, name, type) is centralized in `UMLNode.tsx`.

### Contextual Interaction System
- **Context Menu**: A fixed-position portal rendered in `DiagramCanvas.tsx` that maps screen coordinates to flow coordinates via `screenToFlowPosition`.
- **Selection Toolbar**: A relative-positioned overlay inside `UMLNode.tsx` that animates in when `selected === true`.
- **Keyboard Hook**: A global `window` listener in `DiagramCanvas.tsx` that filters for non-input targets to prevent shortcut collisions.
- **Auto-Duplicate**: Clones node data and applies a spatial offset (40px) to prevent visual overlapping.

---

## Do NOT Do

- ❌ Add hardcoded margin/padding/z-index values — use `var(--token-name)`
- ❌ Modify the ELK layout algorithm — only CSS/layout changes are permitted
- ❌ Change React Flow API props without understanding the synchronization implications
- ❌ Add state management outside Zustand — no `useState` for diagram state
- ❌ Increase sidebar width beyond `--sidebar-width` — canvas dominance is a hard constraint
