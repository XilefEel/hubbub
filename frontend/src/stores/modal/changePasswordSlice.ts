import type { ChangePasswordSlice, Slice } from "./types";

export const changePasswordSlice: Slice<ChangePasswordSlice> = (set) => ({
  isChangePasswordOpen: false,
  setChangePasswordOpen: (isOpen) => set({ isChangePasswordOpen: isOpen }),
  openChangePasswordModal: () => set({ isChangePasswordOpen: true }),
  closeChangePasswordModal: () => set({ isChangePasswordOpen: false }),
});
