# 🌌 UML Diagram Visualizer

A modern, high-performance web application for visualizing complex UML class structures. Built with **React 19**, **React Flow**, and **Tailwind CSS v4**, this tool provides a premium diagramming experience with a focus on aesthetics and developer productivity.

![UML Diagram Preview](C:\Users\santh\.gemini\antigravity\brain\feeccb74-82a9-454b-ae59-96c74dc631c2\uml_nodes_screenshot.png)

---

## ✨ Features

- **🚀 Custom UML Class Nodes**: Specialized components rendering class names, stereotypes, attributes, and methods with monospace precision.
- **🎨 Premium Dark Theme**: Deep surface palette with glassmorphism, accent borders, and glowing selection states.
- **⚡ Interactive Canvas**: Smooth pan, zoom, and birds-eye minimap powered by React Flow.
- **📦 Typed State Management**: Centralized diagram state using Zustand for seamless updates and future undo/redo support.
- **📏 Dynamic Measurement**: Nodes automatically resize to fit their content (attributes/methods) using modern `ResizeObserver` patterns.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) (TypeScript)
- **Graph Engine**: [React Flow (v12)](https://reactflow.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Layout Engine**: [ELK.js](https://github.com/kieler/elkjs) (Ready for auto-layout)
- **Build Tool**: [Vite 8](https://vitejs.dev/)

---

## 📂 Project Structure

```bash
src/
 ├── components/       # Reusable UI (Canvas, Logo, Glass Panels)
 ├── nodes/            # Custom React Flow Node components (UMLNode)
 ├── edges/            # Custom React Flow Edge components
 ├── store/            # Zustand stores (Diagram & App state)
 ├── styles/           # Tailwind v4 theme & global CSS
 ├── layouts/          # Main application wrappers
 ├── pages/            # View-level components
 └── utils/            # Layout algorithms & helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧬 UML Node Implementation

The project utilizes a custom `UMLNode` component that follows the standard UML class anatomy:

| Section | Visibility | Notation |
|---------|------------|----------|
| **Public** | `+` | Green text |
| **Private** | `-` | Red text |
| **Protected** | `#` | Yellow text |
| **Package** | `~` | Blue text |

**Modifiers Supported:**
- _Italics_ for **Abstract** members.
- <u>Underline</u> for **Static** members.

---

## 📄 License

MIT © 2026 UML Diagram Visualizer Team
