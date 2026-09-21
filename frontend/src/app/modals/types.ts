import type { StateCreator } from "zustand";
import type { Server } from "../../lib/types";

export type CreateServerSlice = {
  isCreateServerOpen: boolean;
  setCreateServerOpen: (isOpen: boolean) => void;
  openCreateServerModal: () => void;
  closeCreateServerModal: () => void;
};

export type JoinServerSlice = {
  isJoinServerOpen: boolean;
  setJoinServerOpen: (isOpen: boolean) => void;
  openJoinServerModal: () => void;
  closeJoinServerModal: () => void;
};

export type EditServerSlice = {
  isEditServerOpen: boolean;
  editServer: Server | null;
  setEditServerOpen: (isOpen: boolean) => void;
  openEditServerModal: (server: Server) => void;
  closeEditServerModal: () => void;
};

export type CreateChannelSlice = {
  isCreateChannelOpen: boolean;
  createChannelServerId: string | null;
  setCreateChannelOpen: (isOpen: boolean) => void;
  openCreateChannelModal: (serverId: string) => void;
  closeCreateChannelModal: () => void;
};

export type EditChannelSlice = {
  isEditChannelOpen: boolean;
  editChannelId: string | null;
  editChannelName: string | null;
  setEditChannelOpen: (isOpen: boolean) => void;
  openEditChannelModal: (channelId: string, currentName: string) => void;
  closeEditChannelModal: () => void;
};

export type DeleteMessageSlice = {
  isDeleteMessageOpen: boolean;
  deleteMessageId: string | null;
  setDeleteMessageOpen: (isOpen: boolean) => void;
  openDeleteMessageModal: (messageId: string) => void;
  closeDeleteMessageModal: () => void;
};

export type DeleteChannelSlice = {
  isDeleteChannelOpen: boolean;
  deleteChannelId: string | null;
  deleteChannelServerId: string | null;
  setDeleteChannelOpen: (isOpen: boolean) => void;
  openDeleteChannelModal: (serverId: string, channelId: string) => void;
  closeDeleteChannelModal: () => void;
};

export type DeleteServerSlice = {
  isDeleteServerOpen: boolean;
  deleteServerId: string | null;
  setDeleteServerOpen: (isOpen: boolean) => void;
  openDeleteServerModal: (serverId: string) => void;
  closeDeleteServerModal: () => void;
};

export type SettingsSlice = {
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
};

export type UpdateUsernameSlice = {
  isUpdateUsernameOpen: boolean;
  setUpdateUsernameOpen: (isOpen: boolean) => void;
  openUpdateUsernameModal: () => void;
  closeUpdateUsernameModal: () => void;
};

export type ChangePasswordSlice = {
  isChangePasswordOpen: boolean;
  setChangePasswordOpen: (isOpen: boolean) => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
};

export type ModalStore = CreateServerSlice &
  JoinServerSlice &
  CreateChannelSlice &
  EditServerSlice &
  EditChannelSlice &
  DeleteMessageSlice &
  DeleteChannelSlice &
  DeleteServerSlice &
  SettingsSlice &
  UpdateUsernameSlice &
  ChangePasswordSlice;

export type Slice<T> = StateCreator<ModalStore, [], [], T>;
