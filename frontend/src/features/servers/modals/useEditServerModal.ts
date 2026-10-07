import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useEditServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isEditServerOpen,
      server: s.editServer,
      setIsOpen: s.setEditServerOpen,
      openModal: s.openEditServerModal,
      closeModal: s.closeEditServerModal,
    })),
  );
