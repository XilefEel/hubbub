import type { JoinServerSlice, Slice } from "./types";

export const joinServerSlice: Slice<JoinServerSlice> = (set) => ({
  isJoinServerOpen: false,

  openJoinServerModal: () => set({ isJoinServerOpen: true }),
  closeJoinServerModal: () => set({ isJoinServerOpen: false }),
});
