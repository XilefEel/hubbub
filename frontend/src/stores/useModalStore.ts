import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createChannelSlice } from "./modal/createChannelSlice";
import { editChannelSlice } from "./modal/editChannelSlice";
import { deleteMessageSlice } from "./modal/deleteMessageSlice";
import { deleteChannelSlice } from "./modal/deleteChannelSlice";
import { deleteServerSlice } from "./modal/deleteServerSlice";
import type { ModalStore } from "./modal/types";

export const useModalStore = create<ModalStore>((...a) => ({
  ...createChannelSlice(...a),
  ...editChannelSlice(...a),
  ...deleteMessageSlice(...a),
  ...deleteChannelSlice(...a),
  ...deleteServerSlice(...a),
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
