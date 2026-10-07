import type { Slice } from "@/app/modals/types";

export type UpdateUsernameSlice = {
  isUpdateUsernameOpen: boolean;
  setUpdateUsernameOpen: (isOpen: boolean) => void;
  openUpdateUsernameModal: () => void;
  closeUpdateUsernameModal: () => void;
};

export const updateUsernameSlice: Slice<UpdateUsernameSlice> = (set) => ({
  isUpdateUsernameOpen: false,
  setUpdateUsernameOpen: (isOpen) => set({ isUpdateUsernameOpen: isOpen }),
  openUpdateUsernameModal: () => set({ isUpdateUsernameOpen: true }),
  closeUpdateUsernameModal: () => set({ isUpdateUsernameOpen: false }),
});
