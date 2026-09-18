import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Room } from "livekit-client";

type VoiceChannelStore = {
  room: Room | null;
  activeChannelId: string | null;
  participantRecordId: string | null;

  isMuted: boolean;
  isDeafened: boolean;

  setRoom: (room: Room, channelId: string, participantRecordId: string) => void;
  clearRoom: () => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
};

export const useVoiceChannelStore = create<VoiceChannelStore>((set) => ({
  room: null,
  activeChannelId: null,
  participantRecordId: null,

  isMuted: false,
  isDeafened: false,

  setRoom: (room, channelId, participantRecordId) =>
    set({ room, activeChannelId: channelId, participantRecordId }),
  clearRoom: () =>
    set({ room: null, activeChannelId: null, participantRecordId: null }),

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

export const useParticipantRecordId = () =>
  useVoiceChannelStore((s) => s.participantRecordId);

export const useIsMuted = () => useVoiceChannelStore((s) => s.isMuted);

export const useIsDeafened = () => useVoiceChannelStore((s) => s.isDeafened);
