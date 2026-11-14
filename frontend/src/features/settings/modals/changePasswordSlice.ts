import type { Slice } from "@/app/modals/useModalStore";

export type ChangePasswordSlice = {
  isChangePasswordOpen: boolean;
  setChangePasswordOpen: (isOpen: boolean) => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
};

export const changePasswordSlice: Slice<ChangePasswordSlice> = (set) => ({
  isChangePasswordOpen: false,
  setChangePasswordOpen: (isOpen) => set({ isChangePasswordOpen: isOpen }),
  openChangePasswordModal: () => set({ isChangePasswordOpen: true }),
  closeChangePasswordModal: () => set({ isChangePasswordOpen: false }),
});
