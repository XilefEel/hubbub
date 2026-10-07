import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useSettingsModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isSettingsOpen,
      setIsOpen: s.setSettingsOpen,
      openModal: s.openSettingsModal,
      closeModal: s.closeSettingsModal,
    })),
  );
