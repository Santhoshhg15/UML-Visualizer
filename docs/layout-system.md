# Landing Page Layout System

## Section Container Philosophy

A premium editorial layout is not just about centering content; it's about establishing a **rhythm of space** that guides the user's eye and feels intentional. 

### Key Principles:
1. **The 1400px Standard**: All major sections are constrained to a maximum width of 1400px to ensure readability on ultra-wide monitors while maintaining canvas dominance.
2. **Standardized Guttering**: We use a consistent `px-6 lg:px-12` padding system. This ensures that the left and right "gutters" of the page are predictable across every scroll depth.
3. **Editorial Asymmetry**: While the container is centered, the internal grid uses asymmetrical spans (e.g., 2/3 vs 1/3) to create visual tension and interest, avoiding the "stale grid" look of generic SaaS pages.
4. **Negative-Space Strategy**: Dead space is converted into intentional negative space by increasing section margins and ensuring that headers have enough "breathing room" to stand out.

---

## Grid Layout Patterns

### Asymmetrical Bento Grid
Instead of equal-sized columns, we use a mixture of `col-span-2` and `col-span-1` items to break the horizontal line. This makes the "Features" section feel more dynamic and less like a database table.

### Workflow Rhythm
The workflow section uses a staggered or multi-column layout to utilize the full width of the 1400px container, moving away from a single narrow column that leaves empty "wings" on the right side.

---

## Visual Balance Concepts

- **Balanced Asymmetry**: If a header is left-aligned, we might balance it with a right-aligned image or a wider grid below it.
- **Intentional Dead-Space**: We avoid "accidental" empty space (where content just stops too early) by ensuring that grid items stretch or are strategically placed to fill the visual weight of the container.
- **Navbar Alignment**: The navbar, though floating, is designed to feel anchored to the same vertical alignment system as the sections below it.

---

## Premium SaaS Patterns

- **Vercel/Linear Style**: Minimalist, high contrast, generous padding, and subtle gradients that highlight the layout structure rather than hiding it.
- **Framer/Raycast Style**: Large headings with tight tracking, combined with highly structured but flexible grid systems.
