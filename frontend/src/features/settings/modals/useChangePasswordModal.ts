import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useChangePasswordModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isChangePasswordOpen,
      setIsOpen: s.setChangePasswordOpen,
      openModal: s.openChangePasswordModal,
      closeModal: s.closeChangePasswordModal,
    })),
  );
