import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Room } from "livekit-client";
import type { VoiceScope } from "@/lib/types";

type VoiceChannelStore = {
  room: Room | null;
  activeScope: VoiceScope | null;
  presenceId: string | null;

  isMuted: boolean;
  isDeafened: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;

  setRoom: (room: Room, activeScope: VoiceScope, presenceId: string) => void;
  clearRoom: () => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setScreenSharing: (enabled: boolean) => void;
};

export const useVoiceChannelStore = create<VoiceChannelStore>((set) => ({
  room: null,
  activeScope: null,
  presenceId: null,

  isMuted: false,
  isDeafened: false,
  isVideoEnabled: false,
  isScreenSharing: false,

  setRoom: (room, activeScope, presenceId) =>
    set({ room, activeScope, presenceId }),
  clearRoom: () => set({ room: null, activeScope: null, presenceId: null }),

  setMuted: (isMuted) => set({ isMuted }),
  setDeafened: (isDeafened) => set({ isDeafened }),
  setVideoEnabled: (isVideoEnabled) => set({ isVideoEnabled }),
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
}));

export const useVoiceActions = () =>
  useVoiceChannelStore(
    useShallow((s) => ({
      setRoom: s.setRoom,
      clearRoom: s.clearRoom,
      setMuted: s.setMuted,
      setDeafened: s.setDeafened,
      setVideoEnabled: s.setVideoEnabled,
      setScreenSharing: s.setScreenSharing,
    })),
  );

export const useVoiceRoom = () => useVoiceChannelStore((s) => s.room);

export const useActiveScope = () => useVoiceChannelStore((s) => s.activeScope);

export const usePresenceId = () => useVoiceChannelStore((s) => s.presenceId);

export const useIsMuted = () => useVoiceChannelStore((s) => s.isMuted);

export const useIsDeafened = () => useVoiceChannelStore((s) => s.isDeafened);

export const useIsVideoEnabled = () =>
  useVoiceChannelStore((s) => s.isVideoEnabled);

export const useIsScreenSharing = () =>
  useVoiceChannelStore((s) => s.isScreenSharing);
