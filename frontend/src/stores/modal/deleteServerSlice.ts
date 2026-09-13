import type { DeleteServerSlice, Slice } from "./types";

export const deleteServerSlice: Slice<DeleteServerSlice> = (set) => ({
  isDeleteServerOpen: false,
  deleteServerId: null,

  openDeleteServerModal: (serverId) =>
    set({ isDeleteServerOpen: true, deleteServerId: serverId }),
  closeDeleteServerModal: () =>
    set({ isDeleteServerOpen: false, deleteServerId: null }),
});
