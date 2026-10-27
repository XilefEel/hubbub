import { TrackRefContext, VideoTrack } from "@livekit/components-react";
import { useIsDeafened } from "../store/useVoiceChannelStore";
import type { User } from "@/lib/types";
import UserAvatar from "@/features/users/components/UserAvatar";
import { cn } from "cn";
import { MicOff, HeadphoneOff } from "lucide-react";
import VoiceAvatar from "./VoiceAvatar";

export default function VoiceTile({
  userByIdentity,
  cameraOff = "card",
}: {
  userByIdentity: Map<string, User>;
  cameraOff?: "card" | "avatar";
}) {
  const isDeafened = useIsDeafened();

  return (
    <TrackRefContext.Consumer>
      {(trackRef) => {
        if (!trackRef) return null;

        const participant = trackRef.participant;
        const isMicMuted = !participant.isMicrophoneEnabled;
        const hasVideo =
          !!trackRef.publication && !trackRef.publication.isMuted;

        const user = userByIdentity.get(participant.identity);

        // if the participant has no video and the cameraOff is "avatar", just use VoiceAvatar
        if (!hasVideo && cameraOff === "avatar") {
          return <VoiceAvatar trackRef={trackRef} user={user} />;
        }

        return (
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl bg-zinc-800 ring-2",
              participant.isSpeaking ? "ring-teal-500" : "ring-transparent",
            )}
          >
            {hasVideo ? (
              <VideoTrack
                trackRef={trackRef}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                <UserAvatar user={user} size="size-16" />
              </div>
            )}

            <div className="absolute bottom-2 left-2 flex items-center gap-3 rounded-lg bg-black/60 px-3 py-1">
              {isMicMuted && (
                <MicOff className="size-4 shrink-0 text-red-500 dark:text-red-400" />
              )}
              {isDeafened && participant.isLocal && (
                <HeadphoneOff className="size-4 shrink-0 text-red-500 dark:text-red-400" />
              )}
              <span className="text-sm font-medium text-white">
                {participant.name || participant.identity}
              </span>
            </div>
          </div>
        );
      }}
    </TrackRefContext.Consumer>
  );
}
