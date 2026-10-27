import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { useVoiceRoom } from "../store/useVoiceChannelStore";
import type { VoiceScope } from "@/lib/types";
import VideoGrid from "./ServerCallGrid";
import AvatarGrid from "./DmCallGrid";

export default function VoiceRoomView({ scope }: { scope: VoiceScope }) {
  const room = useVoiceRoom();
  if (!room) return null;

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      {scope.type === "conversation" ? (
        <AvatarGrid scope={scope} />
      ) : (
        <VideoGrid scope={scope} />
      )}
    </RoomContext.Provider>
  );
}
