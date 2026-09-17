import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Room } from "livekit-client";

type VoiceChannelStore = {
  room: Room | null;
  activeChannelId: string | null;
  participantRecordId: string | null;
  setRoom: (room: Room, channelId: string, participantRecordId: string) => void;
  clearRoom: () => void;
};

export const useVoiceChannelStore = create<VoiceChannelStore>((set) => ({
  room: null,
  activeChannelId: null,
  participantRecordId: null,
  setRoom: (room, channelId, participantRecordId) =>
    set({ room, activeChannelId: channelId, participantRecordId }),
  clearRoom: () =>
    set({ room: null, activeChannelId: null, participantRecordId: null }),
}));

export const useVoiceActions = () =>
  useVoiceChannelStore(
    useShallow((s) => ({
      setRoom: s.setRoom,
      clearRoom: s.clearRoom,
    })),
  );

export const useVoiceRoom = () => useVoiceChannelStore((s) => s.room);

export const useActiveChannelId = () =>
  useVoiceChannelStore((s) => s.activeChannelId);

export const useParticipantRecordId = () =>
  useVoiceChannelStore((s) => s.participantRecordId);
