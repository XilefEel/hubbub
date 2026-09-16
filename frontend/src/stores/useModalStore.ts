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
import { settingsSlice } from "./modal/settingsSlice";
import { updateUsernameSlice } from "./modal/updateUsernameSlice";
import { changePasswordSlice } from "./modal/changePasswordSlice";
import { editServerSlice } from "./modal/editServerSlice";

export const useModalStore = create<ModalStore>((...a) => ({
  ...createServerSlice(...a),
  ...joinServerSlice(...a),
  ...editServerSlice(...a),
  ...createChannelSlice(...a),
  ...editChannelSlice(...a),
  ...deleteMessageSlice(...a),
  ...deleteChannelSlice(...a),
  ...deleteServerSlice(...a),
  ...settingsSlice(...a),
  ...updateUsernameSlice(...a),
  ...changePasswordSlice(...a),
}));

export const useCreateServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isCreateServerOpen,
      setIsOpen: s.setCreateServerOpen,
      openModal: s.openCreateServerModal,
      closeModal: s.closeCreateServerModal,
    })),
  );

export const useJoinServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isJoinServerOpen,
      setIsOpen: s.setJoinServerOpen,
      openModal: s.openJoinServerModal,
      closeModal: s.closeJoinServerModal,
    })),
  );

export const useEditServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isEditServerOpen,
      server: s.editServer,
      setIsOpen: s.setEditServerOpen,
      openModal: s.openEditServerModal,
      closeModal: s.closeEditServerModal,
    })),
  );

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

export const useDeleteMessageModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteMessageOpen,
      messageId: s.deleteMessageId,
      setIsOpen: s.setDeleteMessageOpen,
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
      setIsOpen: s.setDeleteChannelOpen,
      openModal: s.openDeleteChannelModal,
      closeModal: s.closeDeleteChannelModal,
    })),
  );

export const useDeleteServerModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isDeleteServerOpen,
      serverId: s.deleteServerId,
      setIsOpen: s.setDeleteServerOpen,
      openModal: s.openDeleteServerModal,
      closeModal: s.closeDeleteServerModal,
    })),
  );

export const useSettingsModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isSettingsOpen,
      setIsOpen: s.setSettingsOpen,
      openModal: s.openSettingsModal,
      closeModal: s.closeSettingsModal,
    })),
  );

export const useUpdateUsernameModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isUpdateUsernameOpen,
      setIsOpen: s.setUpdateUsernameOpen,
      openModal: s.openUpdateUsernameModal,
      closeModal: s.closeUpdateUsernameModal,
    })),
  );

export const useChangePasswordModal = () =>
  useModalStore(
    useShallow((s) => ({
      isOpen: s.isChangePasswordOpen,
      setIsOpen: s.setChangePasswordOpen,
      openModal: s.openChangePasswordModal,
      closeModal: s.closeChangePasswordModal,
    })),
  );
