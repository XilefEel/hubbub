import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { MessageScope, Reaction } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useEffect } from "react";

export function useReactions(scope: MessageScope) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.reactions.list(scope.id),
    queryFn: async () => {
      return await pb.collection("reactions").getFullList<Reaction>({
        filter: pb.filter(`message.${scope.type} = {:id}`, { id: scope.id }),
        expand: "user",
      });
    },
    enabled: !!scope.id,
  });

  useEffect(() => {
    if (!scope.id) return;

    const key = queryKeys.reactions.list(scope.id);
    const unsubPromise = pb.collection("reactions").subscribe<Reaction>(
      "*",
      (e) => {
        queryClient.setQueryData<Reaction[]>(key, (old) => {
          if (!old) return old;
          switch (e.action) {
            case "create":
              return old.some((r) => r.id === e.record.id)
                ? old
                : [...old, e.record];
            case "delete":
              return old.filter((r) => r.id !== e.record.id);
            default:
              return old;
          }
        });
      },
      {
        filter: pb.filter(`message.${scope.type} = {:id}`, { id: scope.id }),
        expand: "user",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("reactions subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [scope.id, scope.type, queryClient]);

  return query;
}

export function useCreateReaction() {
  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      return await pb.collection("reactions").create<Reaction>({
        message: messageId,
        emoji,
        user: pb.authStore.record?.id,
      });
    },
  });
}

export function useDeleteReaction() {
  return useMutation({
    mutationFn: async (reactionId: string) => {
      return await pb.collection("reactions").delete(reactionId);
    },
  });
}

export function useToggleReaction() {
  const createReaction = useCreateReaction();
  const deleteReaction = useDeleteReaction();

  const toggle = (reactions: Reaction[], messageId: string, emoji: string) => {
    const currentUserId = pb.authStore.record?.id;
    const existing = reactions?.find(
      (r) =>
        r.message === messageId &&
        r.user === currentUserId &&
        r.emoji === emoji,
    );

    if (existing) {
      deleteReaction.mutate(existing.id);
    } else {
      createReaction.mutate({ messageId, emoji });
    }
  };

  return {
    toggle,
    isPending: createReaction.isPending || deleteReaction.isPending,
  };
}
