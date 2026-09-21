import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { RecordModel } from "pocketbase";
import { useEffect } from "react";

export function useChannelReads() {
  const userId = pb.authStore.record?.id;

  return useQuery({
    queryKey: ["read_states"],
    queryFn: async () => {
      return await pb.collection("read_states").getFullList({
        filter: `user = "${userId}"`,
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
          .update(existing.id, { last_read_at: lastReadAt, mention_count: 0 });
      } catch {
        return await pb.collection("read_states").create({
          user: userId,
          channel: channelId,
          last_read_at: lastReadAt,
          mention_count: 0,
        });
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["read_states"] }),
  });
}

export function useReadStatesSubscription() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = ["read_states"];
    const unsubPromise = pb.collection("read_states").subscribe(
      "*",
      (e) => {
        queryClient.setQueryData<RecordModel[]>(key, (old = []) => {
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
