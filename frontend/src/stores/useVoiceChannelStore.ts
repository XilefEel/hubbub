import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Room } from "livekit-client";

type VoiceChannelStore = {
  room: Room | null;
  activeChannelId: string | null;
  presenceId: string | null;

  isMuted: boolean;
  isDeafened: boolean;

  setRoom: (room: Room, channelId: string, presenceId: string) => void;
  clearRoom: () => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
};

export const useVoiceChannelStore = create<VoiceChannelStore>((set) => ({
  room: null,
  activeChannelId: null,
  presenceId: null,

  isMuted: false,
  isDeafened: false,

  setRoom: (room, channelId, presenceId) =>
    set({ room, activeChannelId: channelId, presenceId }),
  clearRoom: () => set({ room: null, activeChannelId: null, presenceId: null }),

  setMuted: (isMuted) => set({ isMuted }),
  setDeafened: (isDeafened) => set({ isDeafened }),
}));

export const useVoiceActions = () =>
  useVoiceChannelStore(
    useShallow((s) => ({
      setRoom: s.setRoom,
      clearRoom: s.clearRoom,
      setMuted: s.setMuted,
      setDeafened: s.setDeafened,
    })),
  );

export const useVoiceRoom = () => useVoiceChannelStore((s) => s.room);

export const useActiveChannelId = () =>
  useVoiceChannelStore((s) => s.activeChannelId);

export const usePresenceId = () => useVoiceChannelStore((s) => s.presenceId);

export const useIsMuted = () => useVoiceChannelStore((s) => s.isMuted);

export const useIsDeafened = () => useVoiceChannelStore((s) => s.isDeafened);
