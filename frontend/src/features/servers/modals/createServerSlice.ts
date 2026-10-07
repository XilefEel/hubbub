import type { Slice } from "@/app/modals/types";

export type CreateServerSlice = {
  isCreateServerOpen: boolean;
  setCreateServerOpen: (isOpen: boolean) => void;
  openCreateServerModal: () => void;
  closeCreateServerModal: () => void;
};

export const createServerSlice: Slice<CreateServerSlice> = (set) => ({
  isCreateServerOpen: false,
  setCreateServerOpen: (isOpen) => set({ isCreateServerOpen: isOpen }),
  openCreateServerModal: () => set({ isCreateServerOpen: true }),
  closeCreateServerModal: () => set({ isCreateServerOpen: false }),
});
