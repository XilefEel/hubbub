import { create } from "zustand";
import type { ModalStore } from "./types";
import { createChannelSlice } from "@/features/channels/modals/createChannelSlice";
import { deleteChannelSlice } from "@/features/channels/modals/deleteChannelSlice";
import { editChannelSlice } from "@/features/channels/modals/editChannelSlice";
import { createGroupSlice } from "@/features/conversations/modals/createGroupSlice";
import { deleteMessageSlice } from "@/features/messages/modals/deleteMessageSlice";
import { createServerSlice } from "@/features/servers/modals/createServerSlice";
import { deleteServerSlice } from "@/features/servers/modals/deleteServerSlice";
import { editServerSlice } from "@/features/servers/modals/editServerSlice";
import { joinServerSlice } from "@/features/servers/modals/joinServerSlice";
import { changePasswordSlice } from "@/features/settings/modals/changePasswordSlice";
import { settingsSlice } from "@/features/settings/modals/settingsSlice";
import { updateUsernameSlice } from "@/features/settings/modals/updateUsernameSlice";

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
  ...createGroupSlice(...a),
}));
