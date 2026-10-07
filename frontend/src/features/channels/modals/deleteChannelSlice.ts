import type { Slice } from "@/app/modals/types";

export type DeleteChannelSlice = {
  isDeleteChannelOpen: boolean;
  deleteChannelId: string | null;
  deleteChannelServerId: string | null;
  setDeleteChannelOpen: (isOpen: boolean) => void;
  openDeleteChannelModal: (serverId: string, channelId: string) => void;
  closeDeleteChannelModal: () => void;
};

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
