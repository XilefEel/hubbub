import type { Conversation } from "@/lib/types";
import ConversationAvatar from "./ConversationAvatar";
import { pb } from "@/lib/pocketbase";
import {
  getOtherUsers,
  getConversationTitle,
} from "../hooks/useConversationMembers";

export default function ConversationEmpty({
  conversation,
}: {
  conversation: Conversation;
}) {
  const me = pb.authStore.record?.id;
  const users = getOtherUsers(conversation, me);
  const title = getConversationTitle(conversation, me);

  if (!users || users.length === 0) return null;

  return (
    <div className="flex flex-1 flex-col justify-end gap-2 pb-8">
      <ConversationAvatar
        users={users}
        isGroup={conversation.isGroup}
        size="size-20"
      />

      <h1 className="text-3xl font-bold">{title}</h1>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This is the beginning of your direct message history with{" "}
        <span className="font-medium">{title}</span>.
      </p>
    </div>
  );
}
