import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useJoinServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isJoinServerOpen,
      setIsOpen: s.setJoinServerOpen,
      openModal: s.openJoinServerModal,
      closeModal: s.closeJoinServerModal,
    })),
  );
