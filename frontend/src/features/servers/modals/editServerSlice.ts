import type { Slice } from "@/app/modals/types";
import type { Server } from "@/lib/types";

export type EditServerSlice = {
  isEditServerOpen: boolean;
  editServer: Server | null;
  setEditServerOpen: (isOpen: boolean) => void;
  openEditServerModal: (server: Server) => void;
  closeEditServerModal: () => void;
};

export const editServerSlice: Slice<EditServerSlice> = (set) => ({
  isEditServerOpen: false,
  editServer: null,

  setEditServerOpen: (isOpen) => set({ isEditServerOpen: isOpen }),
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
