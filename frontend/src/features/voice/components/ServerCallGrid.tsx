import type { VoiceScope } from "@/lib/types";
import { useTracks, GridLayout } from "@livekit/components-react";
import { Track } from "livekit-client";
import VoiceTile from "./VoiceTile";
import { useUserByIdentity } from "../hooks/useUserByIdentity";

export default function ServerCallGrid({ scope }: { scope: VoiceScope }) {
  const userByIdentity = useUserByIdentity(scope);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  return (
    <GridLayout tracks={tracks}>
      <VoiceTile userByIdentity={userByIdentity} cameraOff="card" />
    </GridLayout>
  );
}
