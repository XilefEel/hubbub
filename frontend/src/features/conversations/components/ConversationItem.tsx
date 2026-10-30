import { Link } from "@tanstack/react-router";
import type { Conversation, VoiceParticipant } from "@/lib/types";
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
import { Phone, X } from "lucide-react";

export default function ConversationItem({
  conversation,
  participants,
}: {
  conversation: Conversation;
  participants: VoiceParticipant[];
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
          "group relative flex w-full items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-100",
          "not-data-[status=active]:hover:bg-zinc-50 dark:not-data-[status=active]:hover:bg-zinc-800",
          "dark:data-[status=active]:bg-zinc-750 data-[status=active]:bg-zinc-100 data-[status=active]:font-semibold",
        )}
      >
        {unread && (
          <span className="absolute top-1/2 -left-0.5 h-4 w-1 -translate-y-1/2 rounded-full bg-teal-500" />
        )}

        <ConversationAvatar
          users={others}
          isGroup={conversation.isGroup}
          size="size-8"
        />

        <span
          className={cn("min-w-0 flex-1 truncate", unread && "font-semibold")}
        >
          {title}
        </span>

        <div className="relative flex shrink-0 items-center justify-end">
          {participants.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-1.5 py-0.5 text-xs font-medium text-teal-500 transition-opacity duration-100 group-hover:opacity-0 dark:bg-teal-500/15">
              <Phone className="size-3 shrink-0" />
              {participants.length}
            </span>
          )}

          <button
            onClick={handleHideConversation}
            className={cn(
              "opacity-0 transition-opacity duration-100 group-hover:opacity-100",
              participants.length > 0 &&
                "absolute inset-y-0 right-0 flex items-center",
            )}
          >
            <X className="size-4 text-zinc-500 transition-colors duration-100 hover:text-zinc-700 dark:hover:text-zinc-300" />
          </button>
        </div>
      </Link>
    </ConversationContextMenu>
  );
}
