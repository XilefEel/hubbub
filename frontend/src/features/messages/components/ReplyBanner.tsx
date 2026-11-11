import type { Message } from "@/lib/types";
import { X } from "lucide-react";

export default function ReplyBanner({
  replyingTo,
  onCancelReply,
}: {
  replyingTo: Message;
  onCancelReply: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-t-xl bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400">
      <span>
        Replying to{" "}
        <span className="font-medium">
          {replyingTo.expand?.user?.name ?? "Unknown"}
        </span>
      </span>

      <button
        onClick={onCancelReply}
        className="text-zinc-400 transition-colors duration-100 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
      >
        <X className="size-4 shrink-0" />
      </button>
    </div>
  );
}
