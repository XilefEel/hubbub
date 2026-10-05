import { Video } from "lucide-react";
import type { Conversation, VoiceScope } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import { useJoinVoiceChannel } from "@/features/voice/hooks/useVoiceChannel";
import ConversationAvatar from "./ConversationAvatar";
import { pb } from "@/lib/pocketbase";
import {
  getOtherUsers,
  getConversationTitle,
} from "../hooks/useConversationMembers";

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

  return (
    <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
      <h2 className="flex items-center gap-3 text-sm font-bold">
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
      </h2>

      <Tooltip content="Start a video call">
        <button
          onClick={() => joinVoice.mutate(scope)}
          className="text-sm transition-colors duration-100 hover:text-teal-500 dark:hover:text-teal-400"
        >
          <Video className="size-4 shrink-0" />
        </button>
      </Tooltip>
    </div>
  );
}
