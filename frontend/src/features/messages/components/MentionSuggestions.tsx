import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";
import { cn } from "cn";

export default function MentionSuggestions({
  mentions,
  selectedIndex,
  handleSelectMention,
}: {
  mentions: User[];
  selectedIndex: number;
  handleSelectMention: (user: User) => void;
}) {
  return (
    <ul className="absolute bottom-full mb-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      {mentions.map((user, i) => (
        <li key={user.id}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectMention(user);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-100",
              i === selectedIndex && "bg-zinc-50 dark:bg-zinc-700/50",
            )}
          >
            <UserAvatar user={user} size="size-5" />
            {user.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
