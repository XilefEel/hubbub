import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import {
  type FriendshipRelation,
  type Friendship,
  type SendFriendRequestResult,
  type User,
} from "@/lib/types";

export function useFriendships(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<Friendship[]>({
    queryKey: queryKeys.friendships.list(userId ?? ""),
    queryFn: async () => {
      return await pb.collection("friendships").getFullList<Friendship>({
        filter: pb.filter("requester = {:id} || addressee = {:id}", {
          id: userId,
        }),
        sort: "-created",
        expand: "requester,addressee",
      });
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.friendships.list(userId);
    const unsubPromise = pb.collection("friendships").subscribe<Friendship>(
      "*",
      (e) => {
        queryClient.setQueryData<Friendship[]>(key, (old = []) => {
          switch (e.action) {
            case "create":
              return old.some((f) => f.id === e.record.id)
                ? old
                : [...old, e.record];
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
      console.warn("friendship subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [userId, queryClient]);

  return query;
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async (username: string): Promise<SendFriendRequestResult> => {
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
        queryClient.invalidateQueries({
          queryKey: queryKeys.friendships.list(currentUserId || ""),
        });
      }
    },
  });
}

export function useRespondToFriendRequest() {
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
  });
}

export function useFriendshipStatus(userId: string | undefined) {
  const currentUserId = pb.authStore.record?.id;

  return useQuery<FriendshipRelation | null>({
    queryKey: queryKeys.friendships.status(currentUserId ?? "", userId ?? ""),
    queryFn: async () => {
      if (!currentUserId || !userId)
        throw new Error(
          "Must be logged in and have a userId to check friendship status",
        );

      let row: Friendship | undefined;

      try {
        row = await pb
          .collection("friendships")
          .getFirstListItem<Friendship>(
            pb.filter(
              "(requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a})",
              { a: currentUserId, b: userId },
            ),
          );
      } catch {
        row = undefined;
      }

      if (!row) return { kind: "none" };

      if (row.status === "accepted")
        return {
          kind: "friends",
          friendship: row,
        };

      return row.requester === currentUserId
        ? { kind: "outgoing_pending", friendship: row }
        : { kind: "incoming_pending", friendship: row };
    },
    enabled: !!currentUserId && !!userId && currentUserId !== userId,
  });
}
