import type { VoiceScope } from "@/lib/types";
import {
  GridLayout,
  isTrackReference,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import VoiceAvatar from "./VoiceAvatar";
import VoiceTile from "./VoiceTile";
import { useUserByIdentity } from "../hooks/useUserByIdentity";

export default function DmCallGrid({ scope }: { scope: VoiceScope }) {
  const userByIdentity = useUserByIdentity(scope);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const hasVisual = tracks.some(
    (t) => isTrackReference(t) && !t.publication.isMuted,
  );

  // if no one open camera or screen share, show avatar only
  if (!hasVisual) {
    return (
      <div className="flex h-full w-full flex-wrap content-center items-center justify-center gap-6 p-6">
        {tracks.map((t) => (
          <VoiceAvatar
            key={t.participant.identity}
            trackRef={t}
            user={userByIdentity.get(t.participant.identity)}
          />
        ))}
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks}>
      <VoiceTile userByIdentity={userByIdentity} cameraOff="avatar" />
    </GridLayout>
  );
}
