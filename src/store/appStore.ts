/**
 * appStore.ts
 * ──────────────────────────────────────────────────
 * Global application state powered by Zustand.
 *
 * This store holds UI‑level state such as the sidebar
 * toggle and theme preference.  Diagram‑specific state
 * (nodes, edges, layout) will live in a dedicated
 * diagramStore once UML features are implemented.
 */

import { create } from 'zustand';

interface AppState {
  /** Whether the left sidebar / panel is open */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  /** Current colour theme */
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  /** Whether the workspace minimap is open */
  isMiniMapOpen: boolean;
  toggleMiniMap: () => void;

  /** Whether the graph is currently being auto-layouted (animation in progress) */
  isLayouting: boolean;
  setIsLayouting: (isLayouting: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  isMiniMapOpen: true,
  toggleMiniMap: () => set((s) => ({ isMiniMapOpen: !s.isMiniMapOpen })),

  isLayouting: false,
  setIsLayouting: (isLayouting) => set({ isLayouting }),
}));
