import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
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
  const isMuted = !participant.isMicrophoneEnabled;
  const showDeafened = isDeafened && participant.isLocal;

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className={cn(
          "rounded-full ring-3 transition-all",
          participant.isSpeaking ? "ring-teal-500" : "ring-transparent",
        )}
      >
        <UserAvatar user={user} size="size-24" />
      </div>

      {(isMuted || showDeafened) && (
        <div className="absolute right-0 bottom-0 flex items-center gap-1.5 rounded-full bg-zinc-900 p-1.5">
          {isMuted && <MicOff className="size-4 shrink-0 text-red-500" />}

          {showDeafened && (
            <HeadphoneOff className="size-4 shrink-0 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
}
