import Checkbox from "@/components/ui/Checkbox";
import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";

export default function FriendPicker({
  friends,
  selected,
  onToggle,
  disabledIds = [],
}: {
  friends: User[];
  selected: string[];
  onToggle: (id: string) => void;
  disabledIds?: string[];
}) {
  return (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {friends.map((u) => {
        const disabled = disabledIds.includes(u.id);
        return (
          <li key={u.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
              <UserAvatar user={u} size="size-6" />
              <span className="flex-1 truncate">{u.name}</span>
              <Checkbox
                checked={disabled || selected.includes(u.id)}
                disabled={disabled}
                onCheckedChange={() => onToggle(u.id)}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
