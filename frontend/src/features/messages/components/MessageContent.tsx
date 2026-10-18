import type { User } from "@/lib/types";

export default function MessageContent({
  content,
  mentions,
}: {
  content: string;
  mentions: User[] | undefined;
}) {
  if (content.trim() === "") return null;

  const parts = mentions?.length ? parseMentions(mentions, content) : [content];

  return (
    <p className="text-sm wrap-anywhere whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="rounded bg-teal-50 px-1 font-semibold text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function parseMentions(mentions: User[], content: string) {
  const names = mentions
    .map((u) => u.name)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (names.length === 0) return [content];

  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`, "g");

  return content.split(pattern);
}
