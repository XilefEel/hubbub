import type { DeleteChannelSlice, Slice } from "./types";

export const deleteChannelSlice: Slice<DeleteChannelSlice> = (set) => ({
  isDeleteChannelOpen: false,
  deleteChannelId: null,
  deleteChannelServerId: null,

  openDeleteChannelModal: (serverId, channelId) =>
    set({
      isDeleteChannelOpen: true,
      deleteChannelServerId: serverId,
      deleteChannelId: channelId,
    }),
  closeDeleteChannelModal: () =>
    set({
      isDeleteChannelOpen: false,
      deleteChannelServerId: null,
      deleteChannelId: null,
    }),
});
