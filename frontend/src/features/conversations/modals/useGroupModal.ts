import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useGroupModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isGroupOpen,
      conversation: s.conversation,
      setIsOpen: s.setGroupOpen,
      openModal: s.openGroupModal,
      closeModal: s.closeGroupModal,
    })),
  );
