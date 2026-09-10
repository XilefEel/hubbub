import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { pb } from "../lib/pocketbase";
import { formatMessageDate, getMessageImageUrl } from "../lib/utils";
import type { Message } from "../lib/types";
import { useEditMessage, useDeleteMessage } from "../hooks/useMessages";

export function MessageItem({ message }: { message: Message }) {
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

  const imageUrl = getMessageImageUrl(message);

  const isOwner = message.user === currentUserId;
  const isPending = editMutation.isPending || deleteMutation.isPending;

  return (
    <div className="group flex items-start gap-4 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
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
            <div className="ml-auto hidden items-center gap-2 group-hover:flex">
              <button
                disabled={isPending}
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(message.content);
                }}
                className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
              >
                <Pencil className="size-4 shrink-0" />
              </button>

              <button
                disabled={isPending}
                onClick={() => {
                  if (confirm("Are you sure you want to delete this message?"))
                    deleteMutation.mutate(message.id);
                }}
                className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
              >
                <Trash className="size-4 shrink-0" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isPending}
              className="flex-1 rounded border border-zinc-300 px-2 py-0.5 text-sm outline-none focus:border-zinc-500"
            />
          </form>
        ) : (
          <p className="text-sm text-zinc-800">{message.content}</p>
        )}

        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block max-w-sm overflow-hidden rounded-xl border border-zinc-200"
          >
            <img
              src={imageUrl}
              alt="Attachment"
              loading="lazy"
              className="w-auto object-cover hover:opacity-95"
            />
          </a>
        )}
      </div>
    </div>
  );
}
