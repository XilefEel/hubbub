import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type {
  Friendship,
  FriendshipRelation,
  SendFriendRequestResult,
  User,
} from "@/lib/types";

export function useFriendships(userId: string | undefined) {
  return useQuery<Friendship[]>({
    queryKey: queryKeys.friendships.byUser(userId),
    queryFn: () =>
      pb.collection("friendships").getFullList<Friendship>({
        filter: pb.filter("requester = {:id} || addressee = {:id}", {
          id: userId,
        }),
        sort: "-created",
        expand: "requester,addressee",
      }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFriendshipsSubscription() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.friendships.byUser(userId);
    const unsubPromise = pb.collection("friendships").subscribe<Friendship>(
      "*",
      (e) => {
        queryClient.setQueryData<Friendship[]>(key, (old) => {
          if (!old) return old;
          switch (e.action) {
            case "create":
              return old.some((f) => f.id === e.record.id)
                ? old
                : [e.record, ...old];
            case "update":
              return old.map((f) => (f.id === e.record.id ? e.record : f));
            case "delete":
              return old.filter((f) => f.id !== e.record.id);
            default:
              return old;
          }
        });
      },
      {
        filter: pb.filter("requester = {:id} || addressee = {:id}", {
          id: userId,
        }),
        expand: "requester,addressee",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("friendships subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [userId, queryClient]);
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string): Promise<SendFriendRequestResult> => {
      const currentUserId = pb.authStore.record?.id;
      if (!currentUserId)
        throw new Error("Must be logged in to send friend requests");

      let targetUser: User;

      try {
        targetUser = await pb
          .collection("users")
          .getFirstListItem<User>(
            pb.filter("name = {:name}", { name: username }),
          );
      } catch {
        return { status: "not_found" };
      }

      if (targetUser.id === currentUserId) {
        return { status: "self" };
      }

      let existing: Friendship | undefined;

      try {
        existing = await pb
          .collection("friendships")
          .getFirstListItem<Friendship>(
            pb.filter(
              "(requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a})",
              { a: currentUserId, b: targetUser.id },
            ),
          );
      } catch {
        existing = undefined;
      }

      if (existing) {
        return existing.status === "accepted"
          ? { status: "already_friends" }
          : { status: "already_pending" };
      }

      await pb.collection("friendships").create({
        requester: currentUserId,
        addressee: targetUser.id,
        status: "pending",
      });

      return { status: "sent" };
    },
    onSuccess: (result) => {
      if (result.status === "sent") {
        return queryClient.invalidateQueries({
          queryKey: queryKeys.friendships.all(),
        });
      }
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({
      friendshipId,
      accept,
    }: {
      friendshipId: string;
      accept: boolean;
    }) => {
      if (!currentUserId)
        throw new Error("Must be logged in to respond to friend requests");

      if (accept) {
        await pb.collection("friendships").update(friendshipId, {
          status: "accepted",
        });
      } else {
        await pb.collection("friendships").delete(friendshipId);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.friendships.all() }),
  });
}

export function useFriendshipStatus(
  userId: string | undefined,
): FriendshipRelation {
  const currentUserId = pb.authStore.record?.id;
  const { data: friendships } = useFriendships(currentUserId);

  const row = friendships?.find(
    (f) =>
      (f.requester === currentUserId && f.addressee === userId) ||
      (f.requester === userId && f.addressee === currentUserId),
  );

  if (!row) return { kind: "none" };

  if (row.status === "accepted")
    return {
      kind: "friends",
      friendship: row,
    };

  return row.requester === currentUserId
    ? { kind: "outgoing_pending", friendship: row }
    : { kind: "incoming_pending", friendship: row };
}

export function useMutualFriends(targetId?: string) {
  const currentUserId = pb.authStore.record?.id;

  const { data } = useQuery({
    queryKey: queryKeys.mutualFriends.byUsers(currentUserId, targetId),
    queryFn: () =>
      pb.send<{ friends: string[] }>(`/api/mutual/${targetId}`, {}),
    enabled: !!targetId && targetId !== currentUserId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: friendships } = useFriendships(currentUserId);
  const ids = new Set(data?.friends ?? []);
  const mutuals: User[] = [];

  for (const f of friendships ?? []) {
    if (f.status === "accepted") {
      const friend =
        f.requester === currentUserId
          ? f.expand?.addressee
          : f.expand?.requester;

      if (friend && ids.has(friend.id)) {
        mutuals.push(friend);
      }
    }
  }

  return mutuals;
}
