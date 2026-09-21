import type { SettingsSlice, Slice } from "@/app/modals/types";

export const settingsSlice: Slice<SettingsSlice> = (set) => ({
  isSettingsOpen: false,
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  openSettingsModal: () => set({ isSettingsOpen: true }),
  closeSettingsModal: () => set({ isSettingsOpen: false }),
});
