import type { Slice } from "@/app/modals/types";
import type { Conversation } from "@/lib/types";

export type GroupSlice = {
  isGroupOpen: boolean;
  conversation: Conversation | null;
  setGroupOpen: (isOpen: boolean) => void;
  openGroupModal: (conversation: Conversation | null) => void;
  closeGroupModal: () => void;
};

export const groupSlice: Slice<GroupSlice> = (set) => ({
  isGroupOpen: false,
  conversation: null,

  setGroupOpen: (isOpen) => set({ isGroupOpen: isOpen }),
  openGroupModal: (conversation) => set({ isGroupOpen: true, conversation }),
  closeGroupModal: () => set({ isGroupOpen: false, conversation: null }),
});
