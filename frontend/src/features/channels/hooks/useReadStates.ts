import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";
import { queryKeys } from "@/lib/querykeys";
import type { ReadState } from "@/lib/types";

export function useChannelReads() {
  const userId = pb.authStore.record?.id;

  return useQuery<ReadState[]>({
    queryKey: queryKeys.readStates.list(),
    queryFn: async () => {
      return await pb.collection("read_states").getFullList<ReadState>({
        filter: pb.filter("user = {:id}", { id: userId }),
      });
    },
  });
}

export function useMarkChannelRead() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({
      channelId,
      lastReadAt,
    }: {
      channelId: string;
      lastReadAt: string;
    }) => {
      try {
        const existing = await pb
          .collection("read_states")
          .getFirstListItem(`user = "${userId}" && channel = "${channelId}"`);

        return await pb
          .collection("read_states")
          .update(existing.id, { lastReadAt, mentionCount: 0 });
      } catch {
        return await pb.collection("read_states").create({
          user: userId,
          channel: channelId,
          lastReadAt,
          mentionCount: 0,
        });
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.readStates.list() }),
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
        queryClient.setQueryData<ReadState[]>(key, (old = []) => {
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
