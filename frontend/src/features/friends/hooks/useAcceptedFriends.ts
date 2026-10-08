import { useFriendships } from "./useFriendships";

export function useAcceptedFriends(userId?: string) {
  const { data: friendships } = useFriendships(userId);

  return (friendships ?? []).flatMap((f) => {
    if (f.status !== "accepted") return [];

    const friend =
      f.requester === userId ? f.expand?.addressee : f.expand?.requester;

    return friend ? [friend] : [];
  });
}
