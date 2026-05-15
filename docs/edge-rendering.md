# UML Edge Rendering System

## SVG Marker Philosophy

Professional diagramming tools avoid manual "arrowhead" overlays because they are prone to alignment drift and visual detachment. Instead, we use **SVG Markers** (`<marker>`) integrated directly into the SVG path rendering engine.

### Why Markers are Superior:
1. **Mathematical Attachment**: The marker is calculated as part of the path's geometry. When the path moves, the marker stays perfectly anchored to the tip.
2. **Auto-Orientation**: Markers automatically align their rotation to the tangent of the path's end-point, ensuring the triangle is always centered on the relationship axis.
3. **Sub-pixel Precision**: By using `viewBox` and `refX/refY`, we can position the connection point with sub-pixel accuracy, eliminating the "detached" look of manual overlays.

---

## UML Arrow Rendering Principles

### Hollow Triangle Precision
To achieve the "hollow" look required by UML Inheritance and Realization while ensuring the line doesn't "bleed through" the arrowhead, we use a **Solid Background Fill** technique.
- The triangle is filled with `var(--color-surface-950)` (the canvas background).
- The stroke is set to `var(--color-surface-500)` to match the edge path.
- The `refX` is positioned at the extreme tip of the triangle, ensuring it touches the node boundary exactly.

### Edge Geometry
We prioritize **Calm Geometry** over aggressive curves.
- **Path Type**: SmoothStep with a generous `borderRadius`.
- **Logic**: This avoids the "spaghetti" look of direct Bezier lines while maintaining a technical, engineered feel.
- **Rhythm**: Relationship lines should feel like "wires" in a precision instrument, not organic strokes.

---

## Relationship Precision Guidelines

1. **Zero-Gap Connection**: The arrowhead must touch the node handle with zero visual gap.
2. **Axis Centering**: The line must enter the base of the triangle exactly at the midpoint.
3. **Contrast Discipline**: Arrowheads use a slightly higher stroke weight than the line to emphasize the relationship type without creating visual noise.

---

## Interaction Design

### Quiet Controls
In a premium workspace, "Delete" and "Swap" controls should not compete with the architectural symbols.
- **Hover-Triggered**: Controls are hidden by default and only reveal themselves when the user intentionally hovers over a relationship.
- **Low Profile**: Buttons are minimized and housed in a subtle, translucent pill that floats at the path's midpoint.
