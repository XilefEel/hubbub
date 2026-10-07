import type { Slice } from "@/app/modals/types";

export type DeleteMessageSlice = {
  isDeleteMessageOpen: boolean;
  deleteMessageId: string | null;
  setDeleteMessageOpen: (isOpen: boolean) => void;
  openDeleteMessageModal: (messageId: string) => void;
  closeDeleteMessageModal: () => void;
};

export const deleteMessageSlice: Slice<DeleteMessageSlice> = (set) => ({
  isDeleteMessageOpen: false,
  deleteMessageId: null,

  setDeleteMessageOpen: (isOpen) => set({ isDeleteMessageOpen: isOpen }),
  openDeleteMessageModal: (messageId) =>
    set({ isDeleteMessageOpen: true, deleteMessageId: messageId }),
  closeDeleteMessageModal: () =>
    set({ isDeleteMessageOpen: false, deleteMessageId: null }),
});
