import { pb } from "@/lib/pocketbase";
import UserAvatar from "@/features/users/components/UserAvatar";
import { useFriendships } from "../hooks/useFriendships";
import { useOpenConversation } from "@/features/conversations/hooks/useOpenConversation";

export default function FriendsList() {
  const userId = pb.authStore.record?.id;
  const { data: friendships } = useFriendships(userId);
  const { open, isPending } = useOpenConversation();

  const accepted = friendships?.filter((f) => f.status === "accepted") ?? [];

  return (
    <div className="flex flex-col gap-1 text-sm">
      <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
        Friends — {accepted.length}
      </h2>

      {accepted.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          No friends yet. Use the Add Friend tab to send a request.
        </p>
      )}

      {accepted.map((f) => {
        const friend =
          f.requester === userId ? f.expand?.addressee : f.expand?.requester;

        return (
          <button
            key={f.id}
            onClick={() => friend && open(friend.id)}
            disabled={isPending}
            className="flex w-full items-center gap-2 rounded px-2 py-1 transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
          >
            <UserAvatar user={friend} size="size-10" />
            <span>{friend?.name || "Unknown User"}</span>
          </button>
        );
      })}
    </div>
  );
}
