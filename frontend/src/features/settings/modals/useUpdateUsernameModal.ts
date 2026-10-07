import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useUpdateUsernameModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isUpdateUsernameOpen,
      setIsOpen: s.setUpdateUsernameOpen,
      openModal: s.openUpdateUsernameModal,
      closeModal: s.closeUpdateUsernameModal,
    })),
  );
