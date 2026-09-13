import type { CreateServerSlice, Slice } from "./types";

export const createServerSlice: Slice<CreateServerSlice> = (set) => ({
  isCreateServerOpen: false,

  openCreateServerModal: () => set({ isCreateServerOpen: true }),
  closeCreateServerModal: () => set({ isCreateServerOpen: false }),
});
