import type { Slice } from "@/app/modals/types";

export type DeleteServerSlice = {
  isDeleteServerOpen: boolean;
  deleteServerId: string | null;
  setDeleteServerOpen: (isOpen: boolean) => void;
  openDeleteServerModal: (serverId: string) => void;
  closeDeleteServerModal: () => void;
};

export const deleteServerSlice: Slice<DeleteServerSlice> = (set) => ({
  isDeleteServerOpen: false,
  deleteServerId: null,

  setDeleteServerOpen: (isOpen) => set({ isDeleteServerOpen: isOpen }),
  openDeleteServerModal: (serverId) =>
    set({ isDeleteServerOpen: true, deleteServerId: serverId }),
  closeDeleteServerModal: () =>
    set({ isDeleteServerOpen: false, deleteServerId: null }),
});
