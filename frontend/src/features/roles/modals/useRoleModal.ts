import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useRoleModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isRoleOpen,
      serverId: s.roleServerId,
      setIsOpen: s.setIsRoleOpen,
      openModal: s.openRoleModal,
      closeModal: s.closeRoleModal,
    })),
  );
