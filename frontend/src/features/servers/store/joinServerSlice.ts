import type { JoinServerSlice, Slice } from "@/app/modals/types";

export const joinServerSlice: Slice<JoinServerSlice> = (set) => ({
  isJoinServerOpen: false,
  setJoinServerOpen: (isOpen) => set({ isJoinServerOpen: isOpen }),
  openJoinServerModal: () => set({ isJoinServerOpen: true }),
  closeJoinServerModal: () => set({ isJoinServerOpen: false }),
});
