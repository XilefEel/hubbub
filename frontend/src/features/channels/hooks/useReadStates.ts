import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";
import { queryKeys } from "@/lib/querykeys";
import type { DateTime, ReadState } from "@/lib/types";
import { ClientResponseError } from "pocketbase";

export function useChannelReads() {
  const userId = pb.authStore.record?.id;

  return useQuery<ReadState[], Error, Map<string, ReadState>>({
    queryKey: queryKeys.readStates.list(),
    queryFn: async () => {
      return await pb.collection("read_states").getFullList<ReadState>({
        filter: pb.filter("user = {:id}", { id: userId }),
      });
    },
    select: (rows) => new Map(rows.map((r) => [r.channel, r])),
  });
}

export function useMarkChannelRead() {
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({
      channelId,
      lastReadAt,
    }: {
      channelId: string;
      lastReadAt: DateTime;
    }) => {
      const filter = pb.filter("user = {:userId} && channel = {:channelId}", {
        userId,
        channelId,
      });

      let existing: ReadState | null = null;

      try {
        existing = await pb.collection("read_states").getFirstListItem(filter);
      } catch (err) {
        if (!(err instanceof ClientResponseError && err.status === 404))
          throw err;
      }

      if (existing) {
        return await pb
          .collection("read_states")
          .update(existing.id, { lastReadAt, mentionCount: 0 });
      }

      return await pb.collection("read_states").create({
        user: userId,
        channel: channelId,
        lastReadAt,
        mentionCount: 0,
      });
    },
  });
}

export function useReadStatesSubscription() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.readStates.list();
    const unsubPromise = pb.collection("read_states").subscribe<ReadState>(
      "*",
      (e) => {
        queryClient.setQueryData<ReadState[]>(key, (old) => {
          if (!old) return old;
          switch (e.action) {
            case "create":
              return old.some((r) => r.id === e.record.id)
                ? old
                : [...old, e.record];
            case "update":
              return old.map((r) => (r.id === e.record.id ? e.record : r));
            case "delete":
              return old.filter((r) => r.id !== e.record.id);
            default:
              return old;
          }
        });
      },
      { filter: pb.filter("user = {:id}", { id: userId }) },
    );

    unsubPromise.catch((err) =>
      console.warn("read state subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient, userId]);
}
