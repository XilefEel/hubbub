import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useDeleteMessageModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteMessageOpen,
      messageId: s.deleteMessageId,
      setIsOpen: s.setDeleteMessageOpen,
      openModal: s.openDeleteMessageModal,
      closeModal: s.closeDeleteMessageModal,
    })),
  );
