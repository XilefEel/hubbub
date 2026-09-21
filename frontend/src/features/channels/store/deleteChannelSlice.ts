import type { DeleteChannelSlice, Slice } from "@/app/modals/types";

export const deleteChannelSlice: Slice<DeleteChannelSlice> = (set) => ({
  isDeleteChannelOpen: false,
  deleteChannelId: null,
  deleteChannelServerId: null,

  setDeleteChannelOpen: (isOpen) => set({ isDeleteChannelOpen: isOpen }),
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
