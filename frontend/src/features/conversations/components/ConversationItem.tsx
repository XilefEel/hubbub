import { Link } from "@tanstack/react-router";
import type { Conversation } from "@/lib/types";
import { pb } from "@/lib/pocketbase";
import {
  getConversationTitle,
  getOtherUsers,
  useHideConversation,
} from "../hooks/useConversationMembers";
import { cn } from "cn";
import { isAfter } from "@/lib/utils";
import ConversationAvatar from "./ConversationAvatar";
import ConversationContextMenu from "./ConversationContextMenu";
import { X } from "lucide-react";

export default function ConversationItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  const userId = pb.authStore.record?.id;

  const me = conversation.expand?.conversation_members_via_conversation?.find(
    (m) => m.user === userId,
  );

  const isOwner = !!me && conversation.owner === me.user;

  const unread =
    !!me &&
    !!conversation.lastMessageAt &&
    (!me.lastReadAt || isAfter(conversation.lastMessageAt, me.lastReadAt));

  const title = getConversationTitle(conversation, userId);
  const others = getOtherUsers(conversation, userId);

  const hideConversation = useHideConversation();

  const handleHideConversation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!me) return;

    hideConversation.mutate({
      memberId: me.id,
      conversationId: conversation.id,
    });
  };

  return (
    <ConversationContextMenu conversation={conversation} isOwner={isOwner}>
      <Link
        to="/me/conversations/$conversationId"
        params={{ conversationId: conversation.id }}
        className={cn(
          "group flex w-full items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-100",
          "not-data-[status=active]:hover:bg-zinc-50 dark:not-data-[status=active]:hover:bg-zinc-800",
          "dark:data-[status=active]:bg-zinc-750 data-[status=active]:bg-zinc-100 data-[status=active]:font-semibold",
        )}
      >
        <ConversationAvatar
          users={others}
          isGroup={conversation.isGroup}
          size="size-8"
        />

        <span className={cn("truncate", unread && "font-semibold")}>
          {title}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {unread && <div className="size-1.5 rounded-full bg-teal-500" />}

          <button
            onClick={handleHideConversation}
            className="opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          >
            <X className="size-4 text-zinc-500 transition-colors duration-100 hover:text-zinc-700 dark:hover:text-zinc-300" />
          </button>
        </div>
      </Link>
    </ConversationContextMenu>
  );
}
