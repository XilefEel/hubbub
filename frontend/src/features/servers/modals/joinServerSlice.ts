import type { Slice } from "@/app/modals/types";

export type JoinServerSlice = {
  isJoinServerOpen: boolean;
  setJoinServerOpen: (isOpen: boolean) => void;
  openJoinServerModal: () => void;
  closeJoinServerModal: () => void;
};

export const joinServerSlice: Slice<JoinServerSlice> = (set) => ({
  isJoinServerOpen: false,
  setJoinServerOpen: (isOpen) => set({ isJoinServerOpen: isOpen }),
  openJoinServerModal: () => set({ isJoinServerOpen: true }),
  closeJoinServerModal: () => set({ isJoinServerOpen: false }),
});
