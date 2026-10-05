import { Link } from "@tanstack/react-router";
import type { Conversation } from "@/lib/types";
import { pb } from "@/lib/pocketbase";
import {
  getConversationTitle,
  getOtherUsers,
} from "../hooks/useConversationMembers";
import { cn } from "cn";
import { isAfter } from "@/lib/utils";
import ConversationAvatar from "./ConversationAvatar";

export default function ConversationItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  const userId = pb.authStore.record?.id;

  const me = conversation.expand?.conversation_members_via_conversation?.find(
    (m) => m.user === userId,
  );

  const unread =
    !!me &&
    !!conversation.lastMessageAt &&
    (!me.lastReadAt || isAfter(conversation.lastMessageAt, me.lastReadAt));

  const title = getConversationTitle(conversation, userId);
  const others = getOtherUsers(conversation, userId);

  return (
    <Link
      to="/me/conversations/$conversationId"
      params={{ conversationId: conversation.id }}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-100",
        "not-data-[status=active]:hover:bg-zinc-50 dark:not-data-[status=active]:hover:bg-zinc-800",
        "dark:data-[status=active]:bg-zinc-750 data-[status=active]:bg-zinc-100 data-[status=active]:font-semibold",
      )}
    >
      <ConversationAvatar
        users={others}
        isGroup={conversation.isGroup}
        size="size-8"
      />

      <span className={cn("truncate", unread && "font-semibold")}>{title}</span>

      {unread && <div className="ml-auto size-1.5 rounded-full bg-teal-500" />}
    </Link>
  );
}
