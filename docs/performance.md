# Performance Optimization Guide

This document details the architectural strategies used to maintain a 60FPS "Premium Editor" experience in the UML Visualizer.

## Design Philosophy

> **Smoothness is the ultimate premium signal.**
>
> Professional tools like Figma, Linear, and Raycast feel expensive because
> they are *fast*, not because they are *flashy*. Every animation removed
> is a frame budget reclaimed.

## 1. Animation Audit — What Was Removed and Why

### Removed: Continuous SVG Edge Animations
- **What**: 3 overlapping `<path>` elements per edge (glow + base + flow) with infinite CSS `@keyframes`
- **Why**: For a diagram with 20 edges, this meant **60 SVG paths** being repainted continuously. The `filter: blur(2px)` on the glow layer alone forced a full GPU texture pass per edge per frame.
- **Replaced with**: Single `<BaseEdge>` path per relationship. Clean, lightweight, UML-correct.

### Removed: Node backdrop-blur and shadow-2xl
- **What**: `backdrop-filter: blur(20px)` and `shadow-2xl` on every UML node
- **Why**: `backdrop-filter` creates a separate compositing layer for each node. With 30 nodes, the GPU had to maintain 30 independent blur passes. Combined with `shadow-2xl` (which triggers a paint on every position change), this was the primary cause of drag lag.
- **Replaced with**: Solid `bg-surface-900` with `shadow-node` (a small, static shadow).

### Removed: Framer Motion from panels
- **What**: `motion.div` with spring physics on Inspector, MiniMap, and Dock
- **Why**: Spring animations run a JS physics simulation every frame. When multiple panels animated simultaneously (e.g., opening Inspector while MiniMap is visible), the main thread was blocked by competing animation loops.
- **Replaced with**: Static `div` elements. Panels appear/disappear instantly — which actually feels *faster* and more professional.

### Removed: Button scale/glow animations
- **What**: `hover:scale-[1.02]`, `active:scale-95`, animated `box-shadow` glows, `transition-all duration-300`
- **Why**: `transition-all` is the most expensive CSS transition — it monitors *every* animatable property. `scale` triggers a full layout recalculation. On a dock with 10+ buttons, this created significant paint overhead.
- **Replaced with**: `transition-colors` (monitors only color properties, no layout impact).

### Removed: Handle hover glow
- **What**: `transition: transform 0.15s ease, box-shadow 0.15s ease` on `.react-flow__handle`
- **Why**: Handles are repositioned on every drag frame. Adding transitions to frequently-repositioned elements causes the browser to interpolate stale values.

### Removed: MiniMap pulse dot
- **What**: `animate-pulse` on a decorative dot, `shadow-[0_0_10px_rgba(59,130,246,0.6)]`
- **Why**: Continuous animation consuming GPU resources for zero functional value.

## 2. Magic Layout — requestAnimationFrame Architecture

### Why Not Framer Motion `animate()`?
Framer Motion's `animate()` adds overhead:
1. Spring physics simulation per frame
2. Easing curve interpolation via the library's internal scheduler
3. React state batching through Framer's own update queue

For a simple A→B position interpolation, this is unnecessary machinery.

### Current Implementation
```
requestAnimationFrame loop × 400ms
├── Read: animationMap[nodeId] (O(1) lookup)
├── Compute: linear interpolation with ease-out
├── Write: setNodes(functional update)
└── React Flow: recalculates edge paths automatically
```

- **Duration**: 400ms (fast enough to feel responsive, slow enough for spatial continuity)
- **Easing**: `1 - (1-t)²` — simple quadratic ease-out for subtle deceleration
- **fitView()**: Called AFTER animation completes, not simultaneously

### Why Sequential fitView?
Running `fitView({ duration: 800 })` simultaneously with the node animation created two competing viewport transformations — the camera was trying to center on *both* the old and new positions at the same time, causing visible jitter.

## 3. Performance Mode (CSS Class Toggle)

During Magic Layout, the wrapper div receives `.performance-mode`:

```css
.performance-mode .backdrop-blur-xl,
.performance-mode .backdrop-blur-2xl { 
  backdrop-filter: none !important; 
}
.performance-mode .react-flow__node { 
  box-shadow: none !important; 
}
```

This strips the remaining expensive effects during the 400ms animation window.

## 4. React Flow Performance Rules

1. **`nodeTypes` and `edgeTypes` are defined outside the component** — prevents unmount/remount cycles
2. **UMLNode is wrapped in `React.memo`** — prevents re-render when unrelated nodes change
3. **`setNodes` uses functional updates** — ensures batched state writes during animation
4. **Zero `transition-all`** — only `transition-colors` or `transition-opacity` where needed
5. **No `will-change`** — over-promoting layers to GPU is worse than not promoting them

## 5. Rendering Budget

| Component | Before (per frame) | After (per frame) |
|---|---|---|
| Edge (×20) | 60 SVG paths + 20 blur filters | 20 SVG paths, 0 filters |
| Node (×30) | 30 backdrop-blur + 30 shadow-2xl | 30 solid bg + 30 shadow-node |
| Dock | motion.div spring + backdrop-blur | static div, solid bg |
| MiniMap | motion.div spring + backdrop-blur + pulse | static div, solid bg |
| Inspector | motion.div spring + 2× backdrop-blur | static div, solid bg |

**Estimated GPU composite layer reduction: ~70%**
