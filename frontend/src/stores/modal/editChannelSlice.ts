import type { EditChannelSlice, Slice } from "./types";

export const editChannelSlice: Slice<EditChannelSlice> = (set) => ({
  isEditChannelOpen: false,
  editChannelId: null,
  editChannelName: null,

  setEditChannelOpen: (isOpen) => set({ isEditChannelOpen: isOpen }),
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
