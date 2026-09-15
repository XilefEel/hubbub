import type { UpdateUsernameSlice, Slice } from "./types";

export const updateUsernameSlice: Slice<UpdateUsernameSlice> = (set) => ({
  isUpdateUsernameOpen: false,

  openUpdateUsernameModal: () => set({ isUpdateUsernameOpen: true }),
  closeUpdateUsernameModal: () => set({ isUpdateUsernameOpen: false }),
});
