import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";
import {
  useParticipantAttributes,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { cn } from "cn";
import { MicOff, HeadphoneOff } from "lucide-react";
import { useIsDeafened } from "../store/useVoiceChannelStore";

export default function VoiceAvatar({
  trackRef,
  user,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  user?: User;
}) {
  const isDeafened = useIsDeafened();

  const participant = trackRef.participant;
  const { attributes } = useParticipantAttributes({ participant });

  const showMuted = !participant.isMicrophoneEnabled;
  const showDeafened =
    attributes?.deafened === "true" || (participant.isLocal && isDeafened);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={cn(
            "flex rounded-full ring-3 transition-all",
            participant.isSpeaking ? "ring-teal-500" : "ring-transparent",
          )}
        >
          <UserAvatar user={user} size="size-24" />
        </div>

        {(showMuted || showDeafened) && (
          <div className="absolute right-0 bottom-0 flex items-center gap-1.5 rounded-full bg-zinc-900 p-1.5">
            {showMuted && <MicOff className="size-4 shrink-0 text-red-500" />}
            {showDeafened && (
              <HeadphoneOff className="size-4 shrink-0 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
