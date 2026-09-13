import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type ModalStore = {
  isCreateChannelOpen: boolean;
  createChannelServerId: string | null;
  openCreateChannelModal: (serverId: string) => void;
  closeCreateChannelModal: () => void;

  isDeleteMessageOpen: boolean;
  deleteMessageId: string | null;
  openDeleteMessageModal: (messageId: string) => void;
  closeDeleteMessageModal: () => void;

  isDeleteServerOpen: boolean;
  deleteServerId: string | null;
  openDeleteServerModal: (serverId: string) => void;
  closeDeleteServerModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isCreateChannelOpen: false,
  createChannelServerId: null,
  openCreateChannelModal: (serverId) =>
    set({ isCreateChannelOpen: true, createChannelServerId: serverId }),
  closeCreateChannelModal: () =>
    set({ isCreateChannelOpen: false, createChannelServerId: null }),

  isDeleteMessageOpen: false,
  deleteMessageId: null,
  openDeleteMessageModal: (messageId) =>
    set({ isDeleteMessageOpen: true, deleteMessageId: messageId }),
  closeDeleteMessageModal: () =>
    set({ isDeleteMessageOpen: false, deleteMessageId: null }),

  isDeleteServerOpen: false,
  deleteServerId: null,
  openDeleteServerModal: (serverId) =>
    set({ isDeleteServerOpen: true, deleteServerId: serverId }),
  closeDeleteServerModal: () =>
    set({ isDeleteServerOpen: false, deleteServerId: null }),
}));

export const useCreateChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateChannelOpen,
      serverId: s.createChannelServerId,
      openModal: s.openCreateChannelModal,
      closeModal: s.closeCreateChannelModal,
    })),
  );

export const useDeleteMessageModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteMessageOpen,
      messageId: s.deleteMessageId,
      openModal: s.openDeleteMessageModal,
      closeModal: s.closeDeleteMessageModal,
    })),
  );

export const useDeleteServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteServerOpen,
      serverId: s.deleteServerId,
      openModal: s.openDeleteServerModal,
      closeModal: s.closeDeleteServerModal,
    })),
  );
