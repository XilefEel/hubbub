import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { ModalStore } from "./modal/types";
import { createChannelSlice } from "./modal/createChannelSlice";
import { editChannelSlice } from "./modal/editChannelSlice";
import { deleteMessageSlice } from "./modal/deleteMessageSlice";
import { deleteChannelSlice } from "./modal/deleteChannelSlice";
import { deleteServerSlice } from "./modal/deleteServerSlice";
import { createServerSlice } from "./modal/createServerSlice";
import { joinServerSlice } from "./modal/joinServerSlice";

export const useModalStore = create<ModalStore>((...a) => ({
  ...createServerSlice(...a),
  ...joinServerSlice(...a),
  ...createChannelSlice(...a),
  ...editChannelSlice(...a),
  ...deleteMessageSlice(...a),
  ...deleteChannelSlice(...a),
  ...deleteServerSlice(...a),
}));

export const useCreateServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateServerOpen,
      openModal: s.openCreateServerModal,
      closeModal: s.closeCreateServerModal,
    })),
  );

export const useJoinServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isJoinServerOpen,
      openModal: s.openJoinServerModal,
      closeModal: s.closeJoinServerModal,
    })),
  );

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
