import { useState } from "react";
import { MessageActions } from "./MessageActions";
import { MessageEditForm } from "./MessageEditForm";
import { useEditMessage, useDeleteMessage } from "../../hooks/useMessages";
import { pb } from "../../lib/pocketbase";
import type { Message } from "../../lib/types";
import { formatMessageDate } from "../../lib/utils";
import { AttachmentGrid } from "./AttachmentGrid";

export function MessageItem({
  message,
  showHeader = true,
}: {
  message: Message;
  showHeader?: boolean;
}) {
  const currentUserId = pb.authStore.record?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

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

  const handleDelete = () => {
    deleteMutation.mutate(message.id);
  };

  const isOwner = message.user === currentUserId;
  const isPending = editMutation.isPending || deleteMutation.isPending;

  if (!showHeader) {
    return (
      <div className="group flex items-start gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
        <div className="w-10 shrink-0" />

        <div className="flex flex-1 flex-col">
          {isEditing ? (
            <MessageEditForm
              value={editContent}
              onChange={setEditContent}
              onSubmit={handleEditSubmit}
              onKeyDown={handleKeyDown}
              disabled={isPending}
            />
          ) : (
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-zinc-800">{message.content}</p>

              {isOwner && (
                <MessageActions
                  isPending={isPending}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}

          <AttachmentGrid message={message} />
        </div>
      </div>
    );
  }

  return (
    <div className="group mt-2 flex items-start gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
      <div className="size-10 shrink-0 rounded-full bg-teal-100" />

      <div className="flex flex-1 flex-col">
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

          {isOwner && !isEditing && (
            <MessageActions
              isPending={isPending}
              onEdit={startEditing}
              onDelete={handleDelete}
            />
          )}
        </div>

        {isEditing ? (
          <MessageEditForm
            value={editContent}
            onChange={setEditContent}
            onSubmit={handleEditSubmit}
            onKeyDown={handleKeyDown}
            disabled={isPending}
          />
        ) : (
          <p className="text-sm text-zinc-800">{message.content}</p>
        )}

        <AttachmentGrid message={message} />
      </div>
    </div>
  );
}
