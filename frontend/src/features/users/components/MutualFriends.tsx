import { useMutualFriends } from "@/features/friends/hooks/useFriendships";
import UserAvatar from "@/features/users/components/UserAvatar";

export default function MutualFriends({ userId }: { userId: string }) {
  const friends = useMutualFriends(userId);

  if (friends.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        Mutual Friends — {friends.length}
      </h3>

      <ul className="flex flex-col gap-1">
        {friends.map((friend) => (
          <li key={friend.id} className="flex items-center gap-2 text-sm">
            <UserAvatar user={friend} size="size-6" />
            <span className="truncate">{friend.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
