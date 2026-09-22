import { useEffect, useMemo, useRef, useState } from "react";
import { MessageActions } from "./MessageActions";
import { MessageEditForm } from "./MessageEditForm";
import { useEditMessage } from "../hooks/useMessages";
import { pb } from "@/lib/pocketbase";
import type { Message, Reaction } from "@/lib/types";
import { formatMessageDate, getTime, groupReactionsByEmoji } from "@/lib/utils";
import { AttachmentGrid } from "./AttachmentGrid";
import { ReplyReference } from "./ReplyReference";
import { MessageContextMenu } from "./MessageContextMenu";
import { useToggleReaction } from "../hooks/useReactions";
import { ReactionRow } from "./ReactionRow";
import UserAvatar from "@/components/ui/UserAvatar";
import MessageContent from "./MessageContent";

export function MessageItem({
  message,
  reactions,
  showHeader = true,
  onReply,
}: {
  message: Message;
  reactions: Reaction[];
  showHeader?: boolean;
  onReply: (message: Message) => void;
}) {
  const currentUserId = pb.authStore.record?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editContainerRef = useRef<HTMLDivElement>(null);

  const editMutation = useEditMessage(() => setIsEditing(false));

  const handleEditSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    editMutation.mutate({ messageId: message.id, content: editContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleReply = () => onReply(message);

  const { toggle } = useToggleReaction();

  const handleToggleReaction = (emoji: string) => {
    if (!reactions) return;
    toggle(reactions, message.id, emoji);
  };

  const groupedReactions = useMemo(
    () => groupReactionsByEmoji(reactions, currentUserId),
    [reactions, currentUserId],
  );

  const isOwner = message.user === currentUserId;
  const isPending = editMutation.isPending;

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        setEditContent(message.content);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, message.content]);

  return (
    <MessageContextMenu
      messageId={message.id}
      isOwner={isOwner}
      isPending={isPending}
      onReply={handleReply}
      onEdit={startEditing}
    >
      <div className="group relative flex items-start gap-4 rounded-lg px-2 py-1.5 transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
        {showHeader ? (
          <UserAvatar user={message.expand?.user} />
        ) : (
          <div className="w-10 shrink-0">
            <span className="absolute top-2.5 left-2.5 text-[10px] text-zinc-400 opacity-0 transition-opacity duration-100 group-hover:opacity-100 dark:text-zinc-500">
              {getTime(message.created)}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {message.expand?.replyTo && (
            <ReplyReference replyTo={message.expand.replyTo} />
          )}

          {showHeader && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">
                {message.expand?.user?.name || "Unknown User"}
              </span>

              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {formatMessageDate(message.created)}
              </span>

              {message.updated !== message.created && (
                <span className="text-[10px] text-zinc-400 italic dark:text-zinc-500">
                  (edited)
                </span>
              )}
            </div>
          )}

          {isEditing ? (
            <div ref={editContainerRef}>
              <MessageEditForm
                value={editContent}
                onChange={setEditContent}
                onSubmit={handleEditSubmit}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />
            </div>
          ) : (
            <MessageContent
              content={message.content}
              mentions={message.expand?.mentions}
              currentUserId={currentUserId}
            />
          )}

          <AttachmentGrid message={message} />

          <ReactionRow
            reactions={groupedReactions}
            onToggle={handleToggleReaction}
          />
        </div>

        {!isEditing && (
          <MessageActions
            messageId={message.id}
            isPending={isPending}
            onEdit={startEditing}
            isOwner={isOwner}
            onReply={handleReply}
            onToggleReaction={handleToggleReaction}
          />
        )}
      </div>
    </MessageContextMenu>
  );
}
