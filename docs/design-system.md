# Design System — UML Canvas Engineering Workspace

## Why This Matters

Premium engineering tools (Figma, Linear, Raycast) feel polished not because of unique visual effects, but because every spacing decision follows a **consistent rhythm**. When spacing is inconsistent — some panels with 12px padding, others with 24px, buttons that are slightly misaligned — the interface reads as amateur even if every individual pixel looks good. A design token system is the mechanism that enforces consistency at scale.

---

## Token Quick Reference

### Spacing Scale (4px base grid)

| Token | Value | Typical Use |
|---|---|---|
| `--space-1` | 4px | Icon gap, tight row gaps |
| `--space-2` | 8px | Input label gap, button padding |
| `--space-3` | 12px | Panel sub-section gap, field padding |
| `--space-4` | 16px | Panel horizontal padding, section gap |
| `--space-5` | 20px | Toolbar/minimap canvas offset |
| `--space-6` | 24px | Between logical groups in a panel |
| `--space-8` | 32px | Bottom breathing room in scroll areas |

### Panel Sizing

| Token | Value | Component |
|---|---|---|
| `--sidebar-width` | 240px | Left creation panel |
| `--inspector-width` | 260px | Right property panel |
| `--toolbar-height` | 48px | Bottom floating dock |
| `--minimap-width` | 160px | Workspace overview |
| `--minimap-height` | 110px | Workspace overview |
| `--header-height` | 52px | Top bar |

### Border Radius Scale

| Token | Value | Use Case |
|---|---|---|
| `--radius-sm` | 4px | Compact UI elements (vis selector, tiny buttons) |
| `--radius-md` | 6px | Inputs, standard buttons |
| `--radius-lg` | 8px | Panels, minimap, controls widget |
| `--radius-xl` | 12px | Cards, modals |
| `--radius-2xl` | 16px | Toolbar dock |
| `--radius-full` | 9999px | Pill-shaped elements, badges |

### Typography Scale

| Token | Value | Use Case |
|---|---|---|
| `--text-2xs` | 10px | Section labels (UPPERCASE, letter-spaced) |
| `--text-xs` | 11px | Field labels, secondary info |
| `--text-sm` | 12px | Input values, member text, body |
| `--text-base` | 13px | Primary body text |
| `--text-md` | 14px | Prominent values |
| `--text-lg` | 16px | Node class names, panel headers |

> **Rule:** Max 3 distinct font sizes per panel. Variation = noise.

### Z-Index Hierarchy

| Token | Value | Layer |
|---|---|---|
| `--z-canvas` | 0 | React Flow canvas |
| `--z-panel` | 10 | Sidebar, Inspector |
| `--z-minimap` | 15 | Minimap overview |
| `--z-toolbar` | 20 | Floating action dock, header |
| `--z-overlay` | 30 | Modals, alerts |
| `--z-tooltip` | 40 | Tooltips |

### Input Sizing

| Token | Value | Use |
|---|---|---|
| `--input-height-sm` | 28px | Inline inspector rows, selects |
| `--input-height-md` | 32px | Standard sidebar inputs |
| `--input-height-lg` | 36px | Primary action inputs |
| `--textarea-max-h` | 80px | Prevents textarea overflow |

---

## Shared CSS Classes

| Class | Description |
|---|---|
| `.editor-input` | Standard 32px input: radius-md, 0.5px border, soft focus ring |
| `.editor-textarea` | Monospace textarea: max 80px, scroll, no resize |
| `.editor-label` | 10px uppercase, letter-spaced, muted color |
| `.editor-divider` | 0.5px horizontal separator |
| `.panel-scroll` | Scrollable container with smooth-scroll + overscroll containment |

---

## Do NOT Do

- ❌ Hardcode `padding: 16px` — use `var(--space-4)`
- ❌ Use `border-radius: 8px` — use `var(--radius-lg)`  
- ❌ Mix `z-index: 50` manually — use `var(--z-toolbar)`
- ❌ Create a new font size — pick the nearest existing token
- ❌ Add `box-shadow` to inputs — inputs should appear flat, receding
- ❌ Use `1px` borders — all panel borders are `var(--divider-width)` (0.5px)
