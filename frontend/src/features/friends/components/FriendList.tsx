import { pb } from "@/lib/pocketbase";
import UserAvatar from "@/features/users/components/UserAvatar";
import { useAcceptedFriends } from "../hooks/useAcceptedFriends";
import { useOpenConversation } from "@/features/conversations/hooks/useOpenConversation";

export default function FriendsList() {
  const userId = pb.authStore.record?.id;

  const friends = useAcceptedFriends(userId);
  const { open, isPending } = useOpenConversation();

  return (
    <div className="flex flex-col gap-1 text-sm">
      <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
        Friends — {friends.length}
      </h2>

      {friends.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          No friends yet. Use the Add Friend tab to send a request.
        </p>
      )}

      {friends.map((friend) => (
        <button
          key={friend.id}
          onClick={() => open(friend.id)}
          disabled={isPending}
          className="dark:hover:bg-zinc-750 flex w-full items-center gap-2 rounded px-2 py-1 transition-colors duration-100 hover:bg-zinc-50"
        >
          <UserAvatar user={friend} size="size-10" />
          <span>{friend.name || "Unknown User"}</span>
        </button>
      ))}
    </div>
  );
}
