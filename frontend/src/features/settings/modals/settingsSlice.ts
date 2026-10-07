import type { Slice } from "@/app/modals/types";

export type SettingsSlice = {
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
};

export const settingsSlice: Slice<SettingsSlice> = (set) => ({
  isSettingsOpen: false,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  openSettingsModal: () => set({ isSettingsOpen: true }),
  closeSettingsModal: () => set({ isSettingsOpen: false }),
});
