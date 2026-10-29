import { Video } from "lucide-react";
import type { Conversation, VoiceScope } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import UserAvatar from "@/features/users/components/UserAvatar";
import { useJoinVoiceChannel } from "@/features/voice/hooks/useVoiceChannel";
import ConversationAvatar from "./ConversationAvatar";
import { pb } from "@/lib/pocketbase";
import {
  getOtherUsers,
  getConversationTitle,
} from "../hooks/useConversationMembers";
import { useVoiceParticipants } from "@/features/voice/hooks/useVoiceParticipants";

export default function ConversationHeader({
  conversation,
}: {
  conversation: Conversation;
}) {
  const me = pb.authStore.record?.id;
  const users = getOtherUsers(conversation, me);
  const title = getConversationTitle(conversation, me);

  const joinVoice = useJoinVoiceChannel();

  const scope: VoiceScope = {
    type: "conversation",
    id: conversation.id,
  };

  const { data: participants } = useVoiceParticipants(scope);
  const hasCall = !!participants?.length;

  return (
    <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
      <div className="flex items-center gap-3 text-sm font-bold">
        <ConversationAvatar
          users={users}
          isGroup={conversation.isGroup}
          size="size-8"
        />

        <h1 className="font-semibold">{title}</h1>

        {conversation.isGroup && (
          <span className="text-xs text-zinc-500">
            {users.length + 1} members
          </span>
        )}
      </div>

      {hasCall ? (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {participants.map((p) => (
              <UserAvatar key={p.id} user={p.expand?.user} size="size-6" />
            ))}
          </div>

          <button
            onClick={() => joinVoice.mutate(scope)}
            disabled={joinVoice.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1 text-sm font-medium text-white transition-colors duration-100 hover:bg-teal-600 disabled:opacity-50"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            Join call
          </button>
        </div>
      ) : (
        <Tooltip content="Start a call">
          <button
            onClick={() => joinVoice.mutate(scope)}
            disabled={joinVoice.isPending}
            className="text-sm transition-colors duration-100 hover:text-teal-500 disabled:opacity-50 dark:hover:text-teal-400"
          >
            <Video className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
