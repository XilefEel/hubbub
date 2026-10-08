import type { Slice } from "@/app/modals/types";
import type { Conversation } from "@/lib/types";

export type CreateGroupSlice = {
  isCreateGroupOpen: boolean;
  conversation: Conversation | null;
  setCreateGroupOpen: (isOpen: boolean) => void;
  openCreateGroupModal: (conversation: Conversation | null) => void;
  closeCreateGroupModal: () => void;
};

export const createGroupSlice: Slice<CreateGroupSlice> = (set) => ({
  isCreateGroupOpen: false,
  conversation: null,

  setCreateGroupOpen: (isOpen) => set({ isCreateGroupOpen: isOpen }),
  openCreateGroupModal: (conversation) =>
    set({ isCreateGroupOpen: true, conversation }),
  closeCreateGroupModal: () =>
    set({ isCreateGroupOpen: false, conversation: null }),
});
