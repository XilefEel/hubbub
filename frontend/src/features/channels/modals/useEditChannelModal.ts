import { useModalStore } from "@/app/modals/useModalStore";
import { useShallow } from "zustand/react/shallow";

export const useEditChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isEditChannelOpen,
      channelId: s.editChannelId,
      setIsOpen: s.setEditChannelOpen,
      channelName: s.editChannelName,
      openModal: s.openEditChannelModal,
      closeModal: s.closeEditChannelModal,
    })),
  );
