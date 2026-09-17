import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Room } from "livekit-client";

type VoiceChannelStore = {
  room: Room | null;
  activeChannelId: string | null;
  setRoom: (room: Room, channelId: string) => void;
  clearRoom: () => void;
};

export const useVoiceChannelStore = create<VoiceChannelStore>((set) => ({
  room: null,
  activeChannelId: null,

  setRoom: (room, channelId) => set({ room, activeChannelId: channelId }),
  clearRoom: () => set({ room: null, activeChannelId: null }),
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
