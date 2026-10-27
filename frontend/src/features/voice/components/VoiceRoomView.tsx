import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { useVoiceRoom } from "../store/useVoiceChannelStore";
import type { VoiceScope } from "@/lib/types";
import ServerCallGrid from "./ServerCallGrid";
import DmCallGrid from "./DmCallGrid";

export default function VoiceRoomView({ scope }: { scope: VoiceScope }) {
  const room = useVoiceRoom();
  if (!room) return null;

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      {scope.type === "conversation" ? (
        <DmCallGrid scope={scope} />
      ) : (
        <ServerCallGrid scope={scope} />
      )}
    </RoomContext.Provider>
  );
}
