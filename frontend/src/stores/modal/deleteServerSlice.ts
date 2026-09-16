import type { DeleteServerSlice, Slice } from "./types";

export const deleteServerSlice: Slice<DeleteServerSlice> = (set) => ({
  isDeleteServerOpen: false,
  deleteServerId: null,

  setDeleteServerOpen: (isOpen) => set({ isDeleteServerOpen: isOpen }),
  openDeleteServerModal: (serverId) =>
    set({ isDeleteServerOpen: true, deleteServerId: serverId }),
  closeDeleteServerModal: () =>
    set({ isDeleteServerOpen: false, deleteServerId: null }),
});
