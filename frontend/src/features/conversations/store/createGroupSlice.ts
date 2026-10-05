import type { CreateGroupSlice, Slice } from "@/app/modals/types";

export const createGroupSlice: Slice<CreateGroupSlice> = (set) => ({
  isCreateGroupOpen: false,
  setCreateGroupOpen: (isOpen) => set({ isCreateGroupOpen: isOpen }),
  openCreateGroupModal: () => set({ isCreateGroupOpen: true }),
  closeCreateGroupModal: () => set({ isCreateGroupOpen: false }),
});
