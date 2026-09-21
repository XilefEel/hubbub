import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { ModalStore } from "./types";
import { createChannelSlice } from "../../features/channels/store/createChannelSlice";
import { editChannelSlice } from "../../features/channels/store/editChannelSlice";
import { deleteMessageSlice } from "../../features/messages/store/deleteMessageSlice";
import { deleteChannelSlice } from "../../features/channels/store/deleteChannelSlice";
import { deleteServerSlice } from "../../features/servers/store/deleteServerSlice";
import { createServerSlice } from "../../features/servers/store/createServerSlice";
import { joinServerSlice } from "../../features/servers/store/joinServerSlice";
import { settingsSlice } from "../../features/settings/store/settingsSlice";
import { updateUsernameSlice } from "../../features/settings/store/updateUsernameSlice";
import { changePasswordSlice } from "../../features/settings/store/changePasswordSlice";
import { editServerSlice } from "../../features/servers/store/editServerSlice";

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
