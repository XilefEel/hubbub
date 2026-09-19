import { useJoinVoiceChannel } from "../../hooks/useVoiceChannel";
import type { Channel } from "../../lib/types";
import {
  useActiveChannelId,
  useVoiceRoom,
} from "../../stores/useVoiceChannelStore";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { VideoGrid } from "./VideoGrid";

export function VoiceChannel({ channel }: { channel: Channel }) {
  const room = useVoiceRoom();
  const activeChannelId = useActiveChannelId();
  const joinVoice = useJoinVoiceChannel();

  const isConnected = activeChannelId === channel.id;

  if (!room || !isConnected)
    return <button onClick={() => joinVoice.mutate(channel.id)}>Join</button>;

  return (
    <RoomContext.Provider value={room!}>
      <RoomAudioRenderer />
      <VideoGrid channelId={channel.id} />
    </RoomContext.Provider>
  );
}
