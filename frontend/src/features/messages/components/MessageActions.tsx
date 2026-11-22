import { Pencil, Reply, SmilePlus, Trash } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { EmojiPickerPopover } from "@/components/ui/EmojiPickerPopover";
import { useDeleteMessageModal } from "../modals/useDeleteMessageModal";

export default function MessageActions({
  messageId,
  isPending,
  isAuthor,
  onEdit,
  onReply,
  onToggleReaction,
  canManageMessages,
}: {
  messageId: string;
  isPending: boolean;
  isAuthor: boolean;
  onEdit: () => void;
  onReply: () => void;
  onToggleReaction: (emoji: string) => void;
  canManageMessages: boolean;
}) {
  const { openModal } = useDeleteMessageModal();
  const canDelete = isAuthor || canManageMessages;

  return (
    <div className="absolute -top-4 right-0 flex items-center gap-2 rounded-lg px-2 opacity-0 backdrop-blur-xs transition-opacity duration-100 group-hover:opacity-100">
      <button
        onClick={() => onToggleReaction("👍")}
        className="transition-opacity duration-100 hover:opacity-70"
      >
        👍
      </button>

      <button
        onClick={() => onToggleReaction("❤️")}
        className="transition-opacity duration-100 hover:opacity-70"
      >
        ❤️
      </button>

      <button
        onClick={() => onToggleReaction("😂")}
        className="transition-opacity duration-100 hover:opacity-70"
      >
        😂
      </button>

      <EmojiPickerPopover
        onEmojiSelect={onToggleReaction}
        side="top"
        align="end"
      >
        <div>
          <Tooltip content="Add reaction" side="top">
            <div className="text-zinc-400 transition-colors duration-100 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300">
              <SmilePlus className="size-4 shrink-0" />
            </div>
          </Tooltip>
        </div>
      </EmojiPickerPopover>

      <Tooltip content="Reply">
        <button
          onClick={onReply}
          className="text-zinc-400 transition-colors duration-100 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <Reply className="size-4 shrink-0" />
        </button>
      </Tooltip>

      {isAuthor && (
        <Tooltip content="Edit">
          <button
            disabled={isPending}
            onClick={onEdit}
            className="text-zinc-400 transition-colors duration-100 hover:text-zinc-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <Pencil className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}

      {canDelete && (
        <Tooltip content="Delete">
          <button
            disabled={isPending}
            onClick={() => openModal(messageId)}
            className="text-zinc-400 transition-colors duration-100 hover:text-red-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-400"
          >
            <Trash className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
