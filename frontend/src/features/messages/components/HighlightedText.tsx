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
            className="rounded bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
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
