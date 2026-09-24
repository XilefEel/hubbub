import type { Channel } from "@/lib/types";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { useJoinVoiceChannel } from "../hooks/useVoiceChannel";
import {
  useVoiceRoom,
  useActiveChannelId,
} from "../store/useVoiceChannelStore";
import VideoGrid from "./VideoGrid";

export default function VoiceChannel({ channel }: { channel: Channel }) {
  const room = useVoiceRoom();
  const activeChannelId = useActiveChannelId();
  const joinVoice = useJoinVoiceChannel();

  const isConnected = activeChannelId === channel.id;

  if (!room || !isConnected)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-900 dark:text-zinc-100">
        <h2 className="text-2xl font-semibold">{channel.name}</h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          No one is currently in this channel.
        </p>

        <button
          onClick={() => joinVoice.mutate(channel.id)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Join Voice
        </button>
      </div>
    );

  return (
    <RoomContext.Provider value={room!}>
      <RoomAudioRenderer />
      <VideoGrid channelId={channel.id} />
    </RoomContext.Provider>
  );
}
