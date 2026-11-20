import type { Slice } from "@/app/modals/useModalStore";

export type DeleteChannelSlice = {
  isDeleteChannelOpen: boolean;
  deleteChannelId: string | null;
  setDeleteChannelOpen: (isOpen: boolean) => void;
  openDeleteChannelModal: (channelId: string) => void;
  closeDeleteChannelModal: () => void;
};

export const deleteChannelSlice: Slice<DeleteChannelSlice> = (set) => ({
  isDeleteChannelOpen: false,
  deleteChannelId: null,

  setDeleteChannelOpen: (isOpen) => set({ isDeleteChannelOpen: isOpen }),
  openDeleteChannelModal: (channelId) =>
    set({
      isDeleteChannelOpen: true,
      deleteChannelId: channelId,
    }),
  closeDeleteChannelModal: () =>
    set({
      isDeleteChannelOpen: false,
      deleteChannelId: null,
    }),
});
