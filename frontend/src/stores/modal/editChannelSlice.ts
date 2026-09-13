import type { EditChannelSlice, Slice } from "./types";

export const editChannelSlice: Slice<EditChannelSlice> = (set) => ({
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
});
