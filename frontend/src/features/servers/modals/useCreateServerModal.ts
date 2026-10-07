import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useCreateServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateServerOpen,
      setIsOpen: s.setCreateServerOpen,
      openModal: s.openCreateServerModal,
      closeModal: s.closeCreateServerModal,
    })),
  );
