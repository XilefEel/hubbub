import {
  GridLayout,
  useTracks,
  VideoTrack,
  TrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useVoiceParticipants } from "../../hooks/useVoiceChannel";
import type { User } from "../../lib/types";
import UserAvatar from "../ui/UserAvatar";
import { HeadphoneOff, MicOff } from "lucide-react";
import { cn } from "cn";
import { useIsDeafened } from "../../stores/useVoiceChannelStore";

export function VideoGrid({ channelId }: { channelId: string }) {
  const { data: participants } = useVoiceParticipants(channelId);
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const userByIdentity = new Map<string, User>();
  for (const p of participants ?? []) {
    if (p.expand?.user) userByIdentity.set(p.user, p.expand.user);
  }

  return (
    <GridLayout tracks={tracks}>
      <VideoTiles userByIdentity={userByIdentity} />
    </GridLayout>
  );
}

function VideoTiles({ userByIdentity }: { userByIdentity: Map<string, User> }) {
  const isDeafened = useIsDeafened();

  return (
    <TrackRefContext.Consumer>
      {(trackRef) => {
        if (!trackRef) return null;

        const participant = trackRef.participant;

        const hasVideo =
          !!trackRef.publication && !trackRef.publication.isMuted;
        const isMicMuted = !participant.isMicrophoneEnabled;

        const user = userByIdentity.get(participant.identity);

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
