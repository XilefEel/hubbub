import type { SettingsSlice, Slice } from "./types";

export const settingsSlice: Slice<SettingsSlice> = (set) => ({
  isSettingsOpen: false,

  openSettingsModal: () => set({ isSettingsOpen: true }),
  closeSettingsModal: () => set({ isSettingsOpen: false }),
});
