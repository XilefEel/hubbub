import { cn } from "cn";
import type { User } from "@/lib/types";

export default function MessageContent({
  content,
  mentions,
  currentUserId,
}: {
  content: string;
  mentions: User[] | undefined;
  currentUserId: string | undefined;
}) {
  if (!mentions || mentions.length === 0) {
    return (
      <p className="text-sm wrap-anywhere whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
        {content}
      </p>
    );
  }

  const parts = parseMentions(mentions, content);

  return (
    <p className="text-sm wrap-anywhere whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
      {parts.map((part, i) => {
        const mention = mentions.find((u) => `@${u.name}` === part);
        const isMe = mention?.id === currentUserId;

        return mention ? (
          <span
            key={i}
            className={cn(
              "rounded px-1 font-semibold",
              isMe
                ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
            )}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
}

function parseMentions(mentions: User[], content: string) {
  const names = mentions.map((u) => u.name).sort((a, b) => b.length - a.length);

  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`, "g");

  const parts = content.split(pattern);
  return parts;
}
