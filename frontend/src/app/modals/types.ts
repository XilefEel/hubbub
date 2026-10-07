import type { StateCreator } from "zustand";
import type { CreateChannelSlice } from "@/features/channels/modals/createChannelSlice";
import type { DeleteChannelSlice } from "@/features/channels/modals/deleteChannelSlice";
import type { EditChannelSlice } from "@/features/channels/modals/editChannelSlice";
import type { CreateGroupSlice } from "@/features/conversations/modals/createGroupSlice";
import type { DeleteMessageSlice } from "@/features/messages/modals/deleteMessageSlice";
import type { CreateServerSlice } from "@/features/servers/modals/createServerSlice";
import type { DeleteServerSlice } from "@/features/servers/modals/deleteServerSlice";
import type { EditServerSlice } from "@/features/servers/modals/editServerSlice";
import type { JoinServerSlice } from "@/features/servers/modals/joinServerSlice";
import type { ChangePasswordSlice } from "@/features/settings/modals/changePasswordSlice";
import type { SettingsSlice } from "@/features/settings/modals/settingsSlice";
import type { UpdateUsernameSlice } from "@/features/settings/modals/updateUsernameSlice";

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
  ChangePasswordSlice &
  CreateGroupSlice;

export type Slice<T> = StateCreator<ModalStore, [], [], T>;
