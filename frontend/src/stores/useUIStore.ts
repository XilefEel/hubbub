import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type UIStore = {
  isChannelsOpen: boolean | null;
  isMembersOpen: boolean | null;

  setIsChannelsOpen: (isOpen: boolean | null) => void;
  setIsMembersOpen: (isOpen: boolean | null) => void;

  toggleChannels: () => void;
  toggleMembers: () => void;
};

const useUIStore = create<UIStore>((set) => ({
  isChannelsOpen: null,
  isMembersOpen: null,

  setIsChannelsOpen: (isOpen) => set({ isChannelsOpen: isOpen }),
  setIsMembersOpen: (isOpen) => set({ isMembersOpen: isOpen }),

  toggleChannels: () => set((s) => ({ isChannelsOpen: !s.isChannelsOpen })),
  toggleMembers: () => set((s) => ({ isMembersOpen: !s.isMembersOpen })),
}));

export const useIsChannelsOpen = () => useUIStore((s) => s.isChannelsOpen);

export const useIsMembersOpen = () => useUIStore((s) => s.isMembersOpen);

export const useUIActions = () =>
  useUIStore(
    useShallow((s) => ({
      setIsChannelsOpen: s.setIsChannelsOpen,
      setIsMembersOpen: s.setIsMembersOpen,
      toggleChannels: s.toggleChannels,
      toggleMembers: s.toggleMembers,
    })),
  );
