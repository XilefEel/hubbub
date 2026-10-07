import type { Slice } from "@/app/modals/types";

export type EditChannelSlice = {
  isEditChannelOpen: boolean;
  editChannelId: string | null;
  editChannelName: string | null;
  setEditChannelOpen: (isOpen: boolean) => void;
  openEditChannelModal: (channelId: string, currentName: string) => void;
  closeEditChannelModal: () => void;
};

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
