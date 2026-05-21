/**
 * store/index.ts
 * ──────────────────────────────────────────────────
 * Barrel file that re‑exports every Zustand store.
 * Import from `@/store` instead of individual files.
 */

export { useAppStore } from './appStore';
export { useDiagramStore } from './diagramStore';
export { useWindowStore, useWindowDepth } from './windowStore';
