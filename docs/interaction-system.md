# Interaction System Reference

## Keyboard Shortcuts

The editor is designed for a keyboard-first workflow to support professional speed.

| Key | Action | Context |
|---|---|---|
| **A** | Add UML Class | Global / Canvas |
| **I** | Add UML Interface | Global / Canvas |
| **D** | Duplicate Node | Selection (Ctrl/Cmd + D) |
| **Del / Backspace** | Delete Node | Selection |
| **Enter** | Edit Node Title | Selection |
| **Esc** | Cancel Edit / Clear Selection | Active Edit / Global |

---

## Direct Manipulation Actions

### In-Place Editing
- **Double-Click Title**: Renames the class or interface.
- **Double-Click Attribute/Method**: Edits the specific member line.
  - *Format*: `[vis] [name] : [type]` (e.g., `- id : string`)
  - The system parses the visibility prefix automatically.

### Contextual Controls
- **Node Selection Toolbar**: Appears above a selected node.
  - Actions: Duplicate, Delete.
- **Section Hover Buttons**: A `+` button appears on the right of the Attributes/Methods section on hover.
  - Action: Adds a default new member to that specific section.

---

## Right-Click Context Menu

Right-clicking opens a context-aware menu:

### On Node
- **Duplicate**: Clones the node with a 40px offset.
- **Delete**: Removes the node and all connected edges.

### On Canvas (Pane)
- **New Class**: Creates a new class at the click position.
- **New Interface**: Creates a new interface at the click position.

---

## Relationship Creation
- **Drag Handle**: Drag from the bottom handle (Source) to the top handle (Target) of another node to create an inheritance relationship.
- **Default Type**: New relationships default to `extends` (Inheritance). Use the Inspector panel to change to `implements` if needed.
