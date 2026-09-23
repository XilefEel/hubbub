import { CornerUpLeft } from "lucide-react";
import type { Message } from "@/lib/types";

export default function ReplyReference({ replyTo }: { replyTo: Message }) {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
      <CornerUpLeft className="size-3 shrink-0" />
      <span className="font-medium text-zinc-500 dark:text-zinc-400">
        {replyTo.expand?.user?.name ?? "Unknown"}
      </span>
      <span className="truncate">{replyTo.content}</span>
    </div>
  );
}
