import type { User } from "@/lib/types";
import { useFriendships } from "./useFriendships";

export function useAcceptedFriends(userId?: string) {
  const { data: friendships } = useFriendships(userId);

  const friends: User[] = [];

  for (const f of friendships ?? []) {
    if (f.status !== "accepted") continue;

    const friend =
      f.requester === userId ? f.expand?.addressee : f.expand?.requester;

    if (friend) friends.push(friend);
  }

  return friends;
}
