import type { User } from "@/lib/types";
import { parseMentions } from "@/lib/utils";

export default function HighlightedText({
  content,
  mentions,
}: {
  content: string;
  mentions: User[];
}) {
  if (mentions.length === 0) return <>{content}</>;

  return (
    <>
      {parseMentions(mentions, content).map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="rounded bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
