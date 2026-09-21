import type { CreateServerSlice, Slice } from "@/app/modals/types";

export const createServerSlice: Slice<CreateServerSlice> = (set) => ({
  isCreateServerOpen: false,
  setCreateServerOpen: (isOpen) => set({ isCreateServerOpen: isOpen }),
  openCreateServerModal: () => set({ isCreateServerOpen: true }),
  closeCreateServerModal: () => set({ isCreateServerOpen: false }),
});
