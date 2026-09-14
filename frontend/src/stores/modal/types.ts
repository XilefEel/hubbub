import type { StateCreator } from "zustand";

export type CreateServerSlice = {
  isCreateServerOpen: boolean;
  openCreateServerModal: () => void;
  closeCreateServerModal: () => void;
};

export type JoinServerSlice = {
  isJoinServerOpen: boolean;
  openJoinServerModal: () => void;
  closeJoinServerModal: () => void;
};

export type CreateChannelSlice = {
  isCreateChannelOpen: boolean;
  createChannelServerId: string | null;
  openCreateChannelModal: (serverId: string) => void;
  closeCreateChannelModal: () => void;
};

export type EditChannelSlice = {
  isEditChannelOpen: boolean;
  editChannelId: string | null;
  editChannelName: string | null;
  openEditChannelModal: (channelId: string, currentName: string) => void;
  closeEditChannelModal: () => void;
};

export type DeleteMessageSlice = {
  isDeleteMessageOpen: boolean;
  deleteMessageId: string | null;
  openDeleteMessageModal: (messageId: string) => void;
  closeDeleteMessageModal: () => void;
};

export type DeleteChannelSlice = {
  isDeleteChannelOpen: boolean;
  deleteChannelId: string | null;
  deleteChannelServerId: string | null;
  openDeleteChannelModal: (serverId: string, channelId: string) => void;
  closeDeleteChannelModal: () => void;
};

export type DeleteServerSlice = {
  isDeleteServerOpen: boolean;
  deleteServerId: string | null;
  openDeleteServerModal: (serverId: string) => void;
  closeDeleteServerModal: () => void;
};

export type SettingsSlice = {
  isSettingsOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
};

export type ModalStore = CreateServerSlice &
  JoinServerSlice &
  CreateChannelSlice &
  EditChannelSlice &
  DeleteMessageSlice &
  DeleteChannelSlice &
  DeleteServerSlice &
  SettingsSlice;

export type Slice<T> = StateCreator<ModalStore, [], [], T>;
