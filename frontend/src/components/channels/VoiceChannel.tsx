import {
  useJoinVoiceChannel,
  useLeaveVoiceChannel,
  useVoiceParticipants,
} from "../../hooks/useVoiceChannel";
import type { Channel } from "../../lib/types";
import {
  useActiveChannelId,
  useVoiceRoom,
} from "../../stores/useVoiceChannelStore";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";

export function VoiceChannel({ channel }: { channel: Channel }) {
  const { data: participants } = useVoiceParticipants(channel.id);

  const room = useVoiceRoom();
  const activeChannelId = useActiveChannelId();
  const joinVoice = useJoinVoiceChannel();
  const leaveVoice = useLeaveVoiceChannel();

  const isConnected = activeChannelId === channel.id;
  const isPending = joinVoice.isPending && joinVoice.variables === channel.id;

  if (!room || !isConnected)
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

        {leaveVoice.isError && (
          <p>Couldn't leave: {leaveVoice.error.message}</p>
        )}

        <div>
          <h4>Participants:</h4>
          {participants ? (
            <ul>
              {participants.map((p) => (
                <li key={p.id}>{p.expand?.user?.name}</li>
              ))}
            </ul>
          ) : (
            <p>Loading participants...</p>
          )}
        </div>
      </div>
    );

  return (
    <RoomContext.Provider value={room!}>
      <RoomAudioRenderer />
    </RoomContext.Provider>
  );
}
