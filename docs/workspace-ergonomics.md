# Workspace Ergonomics — UML Canvas

## Why This Matters

The editor is a cognitive tool. Everything competing for the user's visual attention draws focus away from the diagram — the actual work. A well-designed workspace is one where the tools **recede** and the canvas **advances**. This is not about making things invisible; it's about establishing clear **visual hierarchy through restraint**.

---

## Canvas Dominance Philosophy

The canvas is the primary surface. Every other element exists in service of it.

| Layer | Element | Visual Weight |
|---|---|---|
| 1 (primary) | UML nodes + relationships | Highest contrast, full color |
| 2 | React Flow canvas background | Neutral dark, minimal texture |
| 3 | Bottom toolbar | Slightly elevated surface, minimal |
| 4 | Inspector panel | Slightly deeper than canvas |
| 5 | Sidebar | Secondary tool panel, receding |
| 6 | Minimap | Ambient indicator, lowest priority |

**Enforcement rules:**
- Sidebar width must never exceed 260px — wider panels compress the canvas perception
- Inspector uses a deeper background than the canvas, so it reads as a "drawer over" not a "wall"
- Panel borders face **away** from the canvas (right border on inspector, left on sidebar) — no border touches the canvas boundary
- Header area is lower contrast than canvas content — supports spatial orientation without competing

---

## Why Spacing Creates Premium Feel

Most developers assume premium = effects (gradients, glows, blur). It doesn't.

**What actually signals quality:**
1. **Rhythm** — consistent spacing between related elements (same gap = related; different gap = separated)
2. **Breathing room** — 24px between logical groups signals confidence and hierarchy
3. **Alignment** — field labels in a column, inputs in a matching column — no visual drift
4. **Restraint** — fewer elements in view = each element reads as more intentional

A panel with 8px inconsistent padding and 16px inconsistent gaps reads as *hastily assembled*, regardless of color or shadow. The same content with a consistent 4px-grid rhythm reads as *considered and engineered*.

---

## Panel Hierarchy: Focus Order

When a user opens the editor, their attention should follow this path:

```
Canvas (diagram) → Nodes → Relationships → Toolbar → Inspector → Sidebar → Minimap
```

The design enforces this by:
- Sidebar: narrower (240px), lower-contrast borders, secondary header
- Inspector: slightly elevated background, slides in over canvas edge
- Toolbar: centered at canvas bottom, grouped actions — clear intent
- Minimap: minimal 160×110px, header-only chrome, no decorations

---

## How Figma, Linear, and Raycast Achieve This

| Tool | Key Principle |
|---|---|
| Figma | Panels are 232–255px max; canvas bleeds to edges; no panel has a shadow facing the canvas |
| Linear | List panels use 10px uppercase labels, 6px radius, consistent 8px/16px rhythm |
| Raycast | Command surface uses 13px body, 10px metadata — max 2 sizes per section |

All three tools share: **tight panel widths, 4px grid spacing, max 2 font sizes per panel, and 120ms hover transitions with no scale**.

---

## Scroll Ergonomics

Scrollable panels must:
- Use `scroll-behavior: smooth`
- Use `overscroll-behavior: contain` — prevents accidental scroll chaining to the browser window
- Use 4px custom scrollbars (width = `var(--scrollbar-width)`)
- Show an overflow fade gradient (`::after` pseudo-element) as a content continuation signal

---

## Do NOT Do

- ❌ Add padding-heavy section cards ("glassmorphism boxes") inside panels — adds visual weight, compresses the actual content space
- ❌ Use `border-right` on the inspector panel — borders between panels and canvas create "wall" feeling
- ❌ Exceed 3 distinct font sizes in one panel — creates noisy hierarchy
- ❌ Animate panels sliding in — panels should appear stable and immediate
- ❌ Show scrollbars wider than 4px — they compete with input widths
- ❌ Put labels that repeat the placeholder text — one or the other, not both
