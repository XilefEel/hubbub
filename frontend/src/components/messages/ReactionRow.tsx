import { cn } from "cn";

export function ReactionRow({
  reactions,
  onToggle,
}: {
  reactions: {
    emoji: string;
    count: number;
    reactedByMe: boolean;
  }[];
  onToggle: (emoji: string) => void;
}) {
  if (reactions.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map(({ emoji, count, reactedByMe }) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            "rounded-full border border-transparent bg-zinc-50 px-2 py-1 text-sm hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600",
            reactedByMe &&
              "border-teal-200 bg-teal-50 hover:bg-teal-100/50 dark:border-teal-500 dark:bg-teal-800 dark:hover:bg-teal-700/50",
          )}
        >
          {emoji} {count}
        </button>
      ))}
    </div>
  );
}
