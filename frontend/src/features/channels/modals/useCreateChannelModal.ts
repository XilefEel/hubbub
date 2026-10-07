import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useCreateChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateChannelOpen,
      serverId: s.createChannelServerId,
      setIsOpen: s.setCreateChannelOpen,
      openModal: s.openCreateChannelModal,
      closeModal: s.closeCreateChannelModal,
    })),
  );
