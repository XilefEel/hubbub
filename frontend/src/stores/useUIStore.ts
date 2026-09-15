import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const theme = localStorage.getItem("theme");
  return theme === "dark" ? "dark" : "light";
}

type UIStore = {
  isChannelsOpen: boolean | null;
  isMembersOpen: boolean | null;
  theme: Theme;

  setIsChannelsOpen: (isOpen: boolean | null) => void;
  setIsMembersOpen: (isOpen: boolean | null) => void;

  toggleChannels: () => void;
  toggleMembers: () => void;
  toggleTheme: () => void;
};

const useUIStore = create<UIStore>((set, get) => ({
  isChannelsOpen: null,
  isMembersOpen: null,
  theme: getInitialTheme(),

  setIsChannelsOpen: (isOpen) => set({ isChannelsOpen: isOpen }),
  setIsMembersOpen: (isOpen) => set({ isMembersOpen: isOpen }),

  toggleChannels: () => set((s) => ({ isChannelsOpen: !s.isChannelsOpen })),
  toggleMembers: () => set((s) => ({ isMembersOpen: !s.isMembersOpen })),

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },
}));

export const useIsChannelsOpen = () => useUIStore((s) => s.isChannelsOpen);

export const useIsMembersOpen = () => useUIStore((s) => s.isMembersOpen);

export const useTheme = () => useUIStore((s) => s.theme);

export const useUIActions = () =>
  useUIStore(
    useShallow((s) => ({
      setIsChannelsOpen: s.setIsChannelsOpen,
      setIsMembersOpen: s.setIsMembersOpen,
      toggleChannels: s.toggleChannels,
      toggleMembers: s.toggleMembers,
      toggleTheme: s.toggleTheme,
    })),
  );
