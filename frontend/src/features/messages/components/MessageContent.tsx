import type { User } from "@/lib/types";

export default function MessageContent({
  content,
  mentions,
}: {
  content: string;
  mentions: User[] | undefined;
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
  const names = mentions.map((u) => u.name).sort((a, b) => b.length - a.length);

  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`, "g");

  const parts = content.split(pattern);
  return parts;
}
