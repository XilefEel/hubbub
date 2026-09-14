import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type UIStore = {
  isLeftbarOpen: boolean | null;
  isRightbarOpen: boolean | null;

  setIsLeftbarOpen: (isOpen: boolean | null) => void;
  setIsRightbarOpen: (isOpen: boolean | null) => void;

  toggleLeftbar: () => void;
  toggleRightbar: () => void;
};

const useUIStore = create<UIStore>((set) => ({
  isLeftbarOpen: null,
  isRightbarOpen: null,

  setIsLeftbarOpen: (isOpen) => set({ isLeftbarOpen: isOpen }),
  setIsRightbarOpen: (isOpen) => set({ isRightbarOpen: isOpen }),

  toggleLeftbar: () =>
    set((state) => ({ isLeftbarOpen: !state.isLeftbarOpen })),
  toggleRightbar: () =>
    set((state) => ({ isRightbarOpen: !state.isRightbarOpen })),
}));

export const useIsLeftbarOpen = () => useUIStore((s) => s.isLeftbarOpen);

export const useIsRightbarOpen = () => useUIStore((s) => s.isRightbarOpen);

export const useUIActions = () =>
  useUIStore(
    useShallow((s) => ({
      setIsLeftbarOpen: s.setIsLeftbarOpen,
      setIsRightbarOpen: s.setIsRightbarOpen,
      toggleLeftbar: s.toggleLeftbar,
      toggleRightbar: s.toggleRightbar,
    })),
  );
