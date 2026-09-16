import type { UpdateUsernameSlice, Slice } from "./types";

export const updateUsernameSlice: Slice<UpdateUsernameSlice> = (set) => ({
  isUpdateUsernameOpen: false,
  setUpdateUsernameOpen: (isOpen) => set({ isUpdateUsernameOpen: isOpen }),
  openUpdateUsernameModal: () => set({ isUpdateUsernameOpen: true }),
  closeUpdateUsernameModal: () => set({ isUpdateUsernameOpen: false }),
});
