import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useCreateGroupModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateGroupOpen,
      setIsOpen: s.setCreateGroupOpen,
      openModal: s.openCreateGroupModal,
      closeModal: s.closeCreateGroupModal,
    })),
  );
