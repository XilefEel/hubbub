import UserAvatar from "@/features/users/components/UserAvatar";
import type { VoiceParticipant } from "@/lib/types";

export default function VoiceParticipantsList({
  participants,
}: {
  participants: VoiceParticipant[];
}) {
  if (!participants.length) return null;

  return (
    <ul className="mt-1 ml-8 flex flex-col gap-1">
      {participants.map((p) => (
        <li key={p.id} className="flex items-center gap-2 text-sm">
          <UserAvatar user={p.expand?.user} size="size-5" />
          {p.expand?.user?.name}
        </li>
      ))}
    </ul>
  );
}
