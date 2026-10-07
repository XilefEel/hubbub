import type { Slice } from "@/app/modals/types";

export type CreateChannelSlice = {
  isCreateChannelOpen: boolean;
  createChannelServerId: string | null;
  setCreateChannelOpen: (isOpen: boolean) => void;
  openCreateChannelModal: (serverId: string) => void;
  closeCreateChannelModal: () => void;
};

export const createChannelSlice: Slice<CreateChannelSlice> = (set) => ({
  isCreateChannelOpen: false,
  createChannelServerId: null,

  setCreateChannelOpen: (isOpen) => set({ isCreateChannelOpen: isOpen }),
  openCreateChannelModal: (serverId) =>
    set({ isCreateChannelOpen: true, createChannelServerId: serverId }),
  closeCreateChannelModal: () =>
    set({ isCreateChannelOpen: false, createChannelServerId: null }),
});
