import { create } from 'zustand';

interface WindowState {
  windowStack: string[];
  bringToFront: (id: string) => void;
  removeWindow: (id: string) => void;
}

export const useWindowStore = create<WindowState>((set) => ({
  windowStack: [],
  bringToFront: (id: string) =>
    set((state) => {
      const filtered = state.windowStack.filter((wId) => wId !== id);
      return { windowStack: [...filtered, id] };
    }),
  removeWindow: (id: string) =>
    set((state) => ({
      windowStack: state.windowStack.filter((wId) => wId !== id),
    })),
}));

const BASE_Z_INDEX = 100;

export function useWindowDepth(id: string) {
  const stack = useWindowStore((state) => state.windowStack);
  const index = stack.indexOf(id);
  
  if (index === -1) {
    return {
      zIndex: BASE_Z_INDEX,
      isActive: false,
    };
  }

  return {
    zIndex: BASE_Z_INDEX + index,
    isActive: index === stack.length - 1,
  };
}
