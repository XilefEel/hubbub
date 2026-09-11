import { useEffect, useRef, useState } from "react";
import { MessageActions } from "./MessageActions";
import { MessageEditForm } from "./MessageEditForm";
import { useEditMessage, useDeleteMessage } from "../../hooks/useMessages";
import { pb } from "../../lib/pocketbase";
import type { Message } from "../../lib/types";
import { formatMessageDate } from "../../lib/utils";
import { AttachmentGrid } from "./AttachmentGrid";
import { ReplyReference } from "./ReplyReference";
import { MessageContextMenu } from "../ui/MessageContextMenu";

export function MessageItem({
  message,
  showHeader = true,
  onReply,
}: {
  message: Message;
  showHeader?: boolean;
  onReply: (message: Message) => void;
}) {
  const currentUserId = pb.authStore.record?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editContainerRef = useRef<HTMLDivElement>(null);

  const editMutation = useEditMessage(() => setIsEditing(false));
  const deleteMutation = useDeleteMessage();

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

  const handleDelete = () => deleteMutation.mutate(message.id);

  const handleReply = () => onReply(message);

  const isOwner = message.user === currentUserId;
  const isPending = editMutation.isPending || deleteMutation.isPending;

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

  if (!showHeader) {
    return (
      <MessageContextMenu
        isOwner={isOwner}
        isPending={isPending}
        onReply={handleReply}
        onEdit={startEditing}
        onDelete={handleDelete}
      >
        <div className="group flex items-start gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
          <div className="w-10 shrink-0" />

          <div className="flex flex-1 flex-col">
            {message.expand?.replyTo && (
              <ReplyReference replyTo={message.expand.replyTo} />
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
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-zinc-800">{message.content}</p>
              </div>
            )}

            <AttachmentGrid message={message} />
          </div>

          <MessageActions
            isPending={isPending}
            onEdit={startEditing}
            onDelete={handleDelete}
            isOwner={isOwner}
            onReply={handleReply}
          />
        </div>
      </MessageContextMenu>
    );
  }

  return (
    <MessageContextMenu
      isOwner={isOwner}
      isPending={isPending}
      onReply={handleReply}
      onEdit={startEditing}
      onDelete={handleDelete}
    >
      <div className="group mt-2 flex items-start gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
        <div className="size-10 shrink-0 rounded-full bg-teal-100" />

        <div className="flex flex-1 flex-col">
          {message.expand?.replyTo && (
            <ReplyReference replyTo={message.expand.replyTo} />
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">
              {message.expand?.user?.name || "Unknown User"}
            </span>

            <span className="text-xs text-zinc-400">
              {formatMessageDate(message.created)}
            </span>

            {message.updated !== message.created && (
              <span className="text-[10px] text-zinc-400 italic">(edited)</span>
            )}
          </div>

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
            <p className="text-sm text-zinc-800">{message.content}</p>
          )}

          <AttachmentGrid message={message} />
        </div>

        {!isEditing && (
          <MessageActions
            isPending={isPending}
            onEdit={startEditing}
            onDelete={handleDelete}
            isOwner={isOwner}
            onReply={handleReply}
          />
        )}
      </div>
    </MessageContextMenu>
  );
}
