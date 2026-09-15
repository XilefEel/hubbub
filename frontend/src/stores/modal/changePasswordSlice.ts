import type { ChangePasswordSlice, Slice } from "./types";

export const changePasswordSlice: Slice<ChangePasswordSlice> = (set) => ({
  isChangePasswordOpen: false,

  openChangePasswordModal: () => set({ isChangePasswordOpen: true }),
  closeChangePasswordModal: () => set({ isChangePasswordOpen: false }),
});
