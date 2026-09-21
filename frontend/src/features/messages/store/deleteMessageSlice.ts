import type { DeleteMessageSlice, Slice } from "@/app/modals/types";

export const deleteMessageSlice: Slice<DeleteMessageSlice> = (set) => ({
  isDeleteMessageOpen: false,
  deleteMessageId: null,

  setDeleteMessageOpen: (isOpen) => set({ isDeleteMessageOpen: isOpen }),
  openDeleteMessageModal: (messageId) =>
    set({ isDeleteMessageOpen: true, deleteMessageId: messageId }),
  closeDeleteMessageModal: () =>
    set({ isDeleteMessageOpen: false, deleteMessageId: null }),
});
