import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type ModalStore = {
  isCreateChannelOpen: boolean;
  createChannelServerId: string | null;
  openCreateChannelModal: (serverId: string) => void;
  closeCreateChannelModal: () => void;

  isEditChannelOpen: boolean;
  editChannelId: string | null;
  editChannelName: string | null;
  openEditChannelModal: (channelId: string, currentName: string) => void;
  closeEditChannelModal: () => void;

  isDeleteMessageOpen: boolean;
  deleteMessageId: string | null;
  openDeleteMessageModal: (messageId: string) => void;
  closeDeleteMessageModal: () => void;

  isDeleteChannelOpen: boolean;
  deleteChannelId: string | null;
  deleteChannelServerId: string | null;
  openDeleteChannelModal: (serverId: string, channelId: string) => void;
  closeDeleteChannelModal: () => void;

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

  isEditChannelOpen: false,
  editChannelId: null,
  editChannelName: null,
  openEditChannelModal: (channelId, currentName) =>
    set({
      isEditChannelOpen: true,
      editChannelId: channelId,
      editChannelName: currentName,
    }),
  closeEditChannelModal: () =>
    set({
      isEditChannelOpen: false,
      editChannelId: null,
      editChannelName: null,
    }),

  isDeleteMessageOpen: false,
  deleteMessageId: null,
  openDeleteMessageModal: (messageId) =>
    set({ isDeleteMessageOpen: true, deleteMessageId: messageId }),
  closeDeleteMessageModal: () =>
    set({ isDeleteMessageOpen: false, deleteMessageId: null }),

  isDeleteChannelOpen: false,
  deleteChannelId: null,
  deleteChannelServerId: null,
  openDeleteChannelModal: (serverId, channelId) => {
    set({
      isDeleteChannelOpen: true,
      deleteChannelServerId: serverId,
      deleteChannelId: channelId,
    });
  },
  closeDeleteChannelModal: () =>
    set({
      isDeleteChannelOpen: false,
      deleteChannelServerId: null,
      deleteChannelId: null,
    }),

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

export const useEditChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isEditChannelOpen,
      channelId: s.editChannelId,
      channelName: s.editChannelName,
      openModal: s.openEditChannelModal,
      closeModal: s.closeEditChannelModal,
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

export const useDeleteChannelModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteChannelOpen,
      channelId: s.deleteChannelId,
      serverId: s.deleteChannelServerId,
      openModal: s.openDeleteChannelModal,
      closeModal: s.closeDeleteChannelModal,
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
