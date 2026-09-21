import { Pencil, Reply, Trash } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { useDeleteMessageModal } from "@/app/modals/useModalStore";

export function MessageActions({
  messageId,
  isPending,
  isOwner,
  onEdit,
  onReply,
  onToggleReaction,
}: {
  messageId: string;
  isPending: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onReply: () => void;
  onToggleReaction: (emoji: string) => void;
}) {
  const { openModal } = useDeleteMessageModal();

  return (
    <div className="ml-auto flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100">
      <button
        onClick={() => onToggleReaction("👍")}
        className="hover:opacity-70"
      >
        👍
      </button>

      <button
        onClick={() => onToggleReaction("❤️")}
        className="hover:opacity-70"
      >
        ❤️
      </button>

      <button
        onClick={() => onToggleReaction("😂")}
        className="hover:opacity-70"
      >
        😂
      </button>

      <Tooltip content="Reply">
        <button
          onClick={onReply}
          className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <Reply className="size-4 shrink-0" />
        </button>
      </Tooltip>

      {isOwner && (
        <>
          <Tooltip content="Edit">
            <button
              disabled={isPending}
              onClick={onEdit}
              className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <Pencil className="size-4 shrink-0" />
            </button>
          </Tooltip>

          <Tooltip content="Delete">
            <button
              disabled={isPending}
              onClick={() => openModal(messageId)}
              className="text-zinc-400 hover:text-red-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-400"
            >
              <Trash className="size-4 shrink-0" />
            </button>
          </Tooltip>
        </>
      )}
    </div>
  );
}
