import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Message } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

export function useMessages(channelId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.messages.list(channelId);

  const query = useQuery<Message[]>({
    queryKey,
    queryFn: async () => {
      return await pb.collection("messages").getFullList<Message>({
        filter: `channel = "${channelId}"`,
        sort: "created",
        expand: "user",
      });
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    // Subscribe to real-time updates for messages in the specified channel
    pb.collection("messages")
      .subscribe<Message>(
        "*",
        (e) => {
          if (e.action === "create") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
              if (old.some((msg) => msg.id === e.record.id)) return old;
              return [...old, e.record];
            });
          }

          if (e.action === "update") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.map((msg) => (msg.id === e.record.id ? e.record : msg)),
            );
          }

          if (e.action === "delete") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.filter((msg) => msg.id !== e.record.id),
            );
          }
        },
        {
          filter: `channel = "${channelId}"`,
          expand: "user",
        },
      )
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("message subscription failed:", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, queryClient]);

  return query;
}
