// features/friends/hooks/useSendFriendRequest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { SendFriendRequestResult, User } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";

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

      const existing = await pb
        .collection("friendships")
        .getFirstListItem(
          pb.filter(
            "(requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a})",
            { a: currentUserId, b: targetUser.id },
          ),
        );

      const existingRow = existing.items[0];

      if (existingRow) {
        return existingRow.status === "accepted"
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
