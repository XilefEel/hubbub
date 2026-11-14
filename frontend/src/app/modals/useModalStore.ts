import { create } from "zustand";
import type { StateCreator } from "zustand";
import {
  type CreateChannelSlice,
  createChannelSlice,
} from "@/features/channels/modals/createChannelSlice";
import {
  type DeleteChannelSlice,
  deleteChannelSlice,
} from "@/features/channels/modals/deleteChannelSlice";
import {
  type EditChannelSlice,
  editChannelSlice,
} from "@/features/channels/modals/editChannelSlice";
import {
  type GroupSlice,
  groupSlice,
} from "@/features/conversations/modals/groupSlice";
import {
  type DeleteMessageSlice,
  deleteMessageSlice,
} from "@/features/messages/modals/deleteMessageSlice";
import {
  type DeleteServerSlice,
  deleteServerSlice,
} from "@/features/servers/modals/deleteServerSlice";
import {
  type JoinServerSlice,
  joinServerSlice,
} from "@/features/servers/modals/joinServerSlice";
import {
  type ServerSlice,
  serverSlice,
} from "@/features/servers/modals/serverSlice";
import {
  type ChangePasswordSlice,
  changePasswordSlice,
} from "@/features/settings/modals/changePasswordSlice";
import {
  type SettingsSlice,
  settingsSlice,
} from "@/features/settings/modals/settingsSlice";
import {
  type UpdateUsernameSlice,
  updateUsernameSlice,
} from "@/features/settings/modals/updateUsernameSlice";

export type ModalStore = ServerSlice &
  JoinServerSlice &
  CreateChannelSlice &
  EditChannelSlice &
  DeleteMessageSlice &
  DeleteChannelSlice &
  DeleteServerSlice &
  SettingsSlice &
  UpdateUsernameSlice &
  ChangePasswordSlice &
  GroupSlice;

export type Slice<T> = StateCreator<ModalStore, [], [], T>;

export const useModalStore = create<ModalStore>((...a) => ({
  ...serverSlice(...a),
  ...joinServerSlice(...a),
  ...createChannelSlice(...a),
  ...editChannelSlice(...a),
  ...deleteMessageSlice(...a),
  ...deleteChannelSlice(...a),
  ...deleteServerSlice(...a),
  ...settingsSlice(...a),
  ...updateUsernameSlice(...a),
  ...changePasswordSlice(...a),
  ...groupSlice(...a),
}));
