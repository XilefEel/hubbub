import type { CreateChannelSlice, Slice } from "./types";

export const createChannelSlice: Slice<CreateChannelSlice> = (set) => ({
  isCreateChannelOpen: false,
  createChannelServerId: null,

  openCreateChannelModal: (serverId) =>
    set({ isCreateChannelOpen: true, createChannelServerId: serverId }),
  closeCreateChannelModal: () =>
    set({ isCreateChannelOpen: false, createChannelServerId: null }),
});
