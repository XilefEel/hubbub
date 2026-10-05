import UserAvatar from "@/features/users/components/UserAvatar";
import { Link } from "@tanstack/react-router";
import type { Conversation } from "@/lib/types";
import { pb } from "@/lib/pocketbase";
import { findPartner } from "../hooks/useConversationMembers";
import { cn } from "cn";
import { isAfter } from "@/lib/utils";

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

  const partner = findPartner(
    conversation.expand?.conversation_members_via_conversation,
    userId,
  );

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
      <UserAvatar user={partner} size="size-8" />
      <span className={cn("truncate", unread && "font-semibold")}>
        {partner?.name ?? "Unknown User"}
      </span>

      {unread && <div className="ml-auto size-1.5 rounded-full bg-teal-500" />}
    </Link>
  );
}
