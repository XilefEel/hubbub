import type { CreateChannelSlice, Slice } from "@/app/modals/types";

export const createChannelSlice: Slice<CreateChannelSlice> = (set) => ({
  isCreateChannelOpen: false,
  createChannelServerId: null,

  setCreateChannelOpen: (isOpen) => set({ isCreateChannelOpen: isOpen }),
  openCreateChannelModal: (serverId) =>
    set({ isCreateChannelOpen: true, createChannelServerId: serverId }),
  closeCreateChannelModal: () =>
    set({ isCreateChannelOpen: false, createChannelServerId: null }),
});
