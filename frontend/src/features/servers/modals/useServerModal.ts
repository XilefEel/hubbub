import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isServerOpen,
      server: s.serverModalServer,
      setIsOpen: s.setServerOpen,
      openCreate: s.openCreateServerModal,
      openEdit: s.openEditServerModal,
      closeModal: s.closeServerModal,
    })),
  );
