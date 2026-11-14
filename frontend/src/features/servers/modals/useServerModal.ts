import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      server: s.server,
      openCreate: s.openCreate,
      openEdit: s.openEdit,
      closeModal: s.closeModal,
      setIsOpen: s.setIsOpen,
    })),
  );
