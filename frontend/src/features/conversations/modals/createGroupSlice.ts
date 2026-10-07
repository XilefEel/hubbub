import type { Slice } from "@/app/modals/types";

export type CreateGroupSlice = {
  isCreateGroupOpen: boolean;
  setCreateGroupOpen: (isOpen: boolean) => void;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;
};

export const createGroupSlice: Slice<CreateGroupSlice> = (set) => ({
  isCreateGroupOpen: false,
  setCreateGroupOpen: (isOpen) => set({ isCreateGroupOpen: isOpen }),
  openCreateGroupModal: () => set({ isCreateGroupOpen: true }),
  closeCreateGroupModal: () => set({ isCreateGroupOpen: false }),
});
