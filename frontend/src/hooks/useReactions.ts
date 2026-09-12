import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Reaction } from "../lib/types";
import { queryKeys } from "../lib/querykeys";
import { useEffect } from "react";

export function useReactions(channelId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.reactions.list(channelId);

  const query = useQuery({
    queryKey: queryKeys.reactions.list(channelId),
    queryFn: async () => {
      return await pb.collection("reactions").getFullList<Reaction>({
        filter: `message.channel = "${channelId}"`,
        expand: "user",
      });
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    // Subscribe to real-time updates for reactions in the specified channel
    pb.collection("reactions")
      .subscribe<Reaction>(
        "*",
        (e) => {
          if (e.action === "create") {
            queryClient.setQueryData<Reaction[]>(queryKey, (old = []) => {
              if (old.some((r) => r.id === e.record.id)) return old;
              return [...old, e.record];
            });
          }

          if (e.action === "delete") {
            queryClient.setQueryData<Reaction[]>(queryKey, (old = []) =>
              old.filter((r) => r.id !== e.record.id),
            );
          }
        },
        {
          filter: `message.channel = "${channelId}"`,
          expand: "user",
        },
      )
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("reactions subscription failed:", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, queryClient]);

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
