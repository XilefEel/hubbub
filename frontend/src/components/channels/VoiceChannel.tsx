import {
  useJoinVoiceChannel,
  useLeaveVoiceChannel,
} from "../../hooks/useVoiceChannel";
import type { Channel } from "../../lib/types";
import { useActiveChannelId } from "../../stores/useVoiceChannelStore";

export function VoiceChannel({ channel }: { channel: Channel }) {
  const activeChannelId = useActiveChannelId();
  const joinVoice = useJoinVoiceChannel();
  const leaveVoice = useLeaveVoiceChannel();

  const isConnected = activeChannelId === channel.id;

  const isPending = joinVoice.isPending && joinVoice.variables === channel.id;

  return (
    <div>
      <span>🔊 {channel.name}</span>

      {isConnected ? (
        <button
          onClick={() => leaveVoice.mutate()}
          disabled={leaveVoice.isPending}
        >
          {leaveVoice.isPending ? "Leaving..." : "Leave"}
        </button>
      ) : (
        <button
          onClick={() => joinVoice.mutate(channel.id)}
          disabled={isPending}
        >
          {isPending ? "Connecting..." : "Join"}
        </button>
      )}

      {joinVoice.isError && <p>Couldn't join: {joinVoice.error.message}</p>}
    </div>
  );
}
