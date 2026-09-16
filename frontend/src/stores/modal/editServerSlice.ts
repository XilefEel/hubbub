import type { EditServerSlice, Slice } from "./types";

export const editServerSlice: Slice<EditServerSlice> = (set) => ({
  isEditServerOpen: false,
  editServer: null,

  openEditServerModal: (server) =>
    set({
      isEditServerOpen: true,
      editServer: server,
    }),
  closeEditServerModal: () =>
    set({
      isEditServerOpen: false,
      editServer: null,
    }),
});
