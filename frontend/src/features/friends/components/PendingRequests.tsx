import { pb } from "@/lib/pocketbase";
import UserAvatar from "@/features/users/components/UserAvatar";
import {
  useFriendships,
  useRespondToFriendRequest,
} from "../hooks/useFriendships";

export default function PendingRequests() {
  const userId = pb.authStore.record?.id;
  const { data: friendships } = useFriendships(userId);
  const respond = useRespondToFriendRequest();

  const incoming =
    friendships?.filter(
      (f) => f.status === "pending" && f.addressee === userId,
    ) ?? [];

  const outgoing =
    friendships?.filter(
      (f) => f.status === "pending" && f.requester === userId,
    ) ?? [];

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No pending friend requests.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {incoming.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
            Incoming — {incoming.length}
          </h2>

          {incoming.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-2 py-1">
              <UserAvatar user={f.expand?.requester} size="size-10" />
              <span>{f.expand?.requester?.name}</span>

              <div className="ml-auto flex gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <button
                  onClick={() =>
                    respond.mutate({ friendshipId: f.id, accept: true })
                  }
                  disabled={respond.isPending}
                  className="transition-colors duration-100 hover:text-zinc-500 dark:hover:text-zinc-400"
                >
                  accept
                </button>

                <button
                  onClick={() =>
                    respond.mutate({ friendshipId: f.id, accept: false })
                  }
                  disabled={respond.isPending}
                  className="transition-colors duration-100 hover:text-zinc-500 dark:hover:text-zinc-400"
                >
                  ignore
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
            Outgoing — {outgoing.length}
          </h2>

          {outgoing.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-2 py-1">
              <UserAvatar user={f.expand?.addressee} size="size-10" />
              <span>{f.expand?.addressee?.name}</span>

              <button
                onClick={() =>
                  respond.mutate({ friendshipId: f.id, accept: false })
                }
                disabled={respond.isPending}
                className="ml-auto text-xs text-zinc-400 transition-colors duration-100 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400"
              >
                cancel
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
