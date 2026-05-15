# Workspace UX Philosophy — UML Canvas

## Direct Manipulation vs. Form-Driven

The core transition in this editor is shifting from a **form-driven** dashboard to a **direct-manipulation** engineering workspace. 

### Why Direct Manipulation Feels More Premium

1.  **Spatial Continuity**: In modern tools like Figma or Miro, your focus stays on the object you are editing. Moving your eyes from the canvas to a sidebar form and back creates cognitive load.
2.  **Immediate Feedback**: Seeing a "NewClass" appear instantly and then renaming it in-place feels more responsive than filling a form and "deploying" it.
3.  **Immersion**: When the canvas is the primary interaction surface, the user feels more "in the flow" of design rather than "managing data".

---

## The "Frictionless" Workflow

### 1. Creation
- **Old way**: Fill form → click button.
- **New way**: Press `A` or Right-click → Node appears exactly where you want it.

### 2. Editing
- **Old way**: Select node → Find field in sidebar → Type → Save.
- **New way**: Double-click the text → Type → Done.

### 3. Modification
- **Old way**: Select node → Use sidebar buttons to add properties.
- **New way**: Hover over the node → Click the contextual `+` button that appears exactly where the new data will go.

---

## Visual-First Editor Principles

| Principle | Implementation |
|---|---|
| **Canvas Dominance** | The canvas is where 90% of interactions happen. |
| **Contextual Proximity** | Controls should be as close as possible to the object they affect (Selection Toolbars, Inline Inputs). |
| **Keyboard-First** | Professional users prefer speed. Every core action has a single-key shortcut. |
| **Quiet UI** | The UI stays out of the way until needed (Hover buttons, auto-hiding context menus). |

---

## Onboarding & The "Empty State"

A blank canvas can be intimidating. Our onboarding UI provides a gentle nudge:
- **Visual Cues**: A "Mouse Pointer" icon to signal interaction.
- **Shortcut Hints**: Showing `A`, `I`, `D` as core primitives.
- **Call to Action**: A primary "Deploy First Class" button to break the ice.

Once the first node is added, the onboarding UI recedes, and the workspace belongs to the user.
