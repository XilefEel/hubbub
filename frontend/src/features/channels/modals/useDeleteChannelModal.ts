import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useDeleteChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteChannelOpen,
      channelId: s.deleteChannelId,
      serverId: s.deleteChannelServerId,
      setIsOpen: s.setDeleteChannelOpen,
      openModal: s.openDeleteChannelModal,
      closeModal: s.closeDeleteChannelModal,
    })),
  );
