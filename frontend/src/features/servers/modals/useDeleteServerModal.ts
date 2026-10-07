import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useDeleteServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteServerOpen,
      serverId: s.deleteServerId,
      setIsOpen: s.setDeleteServerOpen,
      openModal: s.openDeleteServerModal,
      closeModal: s.closeDeleteServerModal,
    })),
  );
