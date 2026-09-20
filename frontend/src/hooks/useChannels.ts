import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { queryKeys } from "../lib/querykeys";
import { useEffect } from "react";

export function useChannels(serverId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.channels.list(serverId);

  const query = useQuery<Channel[]>({
    queryKey,
    queryFn: async () => {
      return await pb.collection("channels").getFullList<Channel>({
        filter: `server = "${serverId}"`,
        sort: "type,name",
      });
    },
    enabled: !!serverId,
  });

  // Subscribe to real-time updates for channels in the specified server
  useEffect(() => {
    if (!serverId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    pb.collection("channels")
      .subscribe<Channel>(
        "*",
        (e) => {
          queryClient.setQueryData<Channel[]>(queryKey, (old = []) => {
            switch (e.action) {
              case "create":
                return old.some((c) => c.id === e.record.id)
                  ? old
                  : [...old, e.record];
              case "update":
                return old.map((c) => (c.id === e.record.id ? e.record : c));
              case "delete":
                return old.filter((c) => c.id !== e.record.id);
              default:
                return old;
            }
          });
        },
        {
          filter: `server = "${serverId}"`,
          sort: "type,name",
        },
      )
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("channel subscription failed:", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, serverId]);

  return query;
}

export function useChannelDetail(channelId: string) {
  return useQuery<Channel>({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
    enabled: !!channelId,
  });
}

export function useCreateChannel(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      type,
    }: {
      name: string;
      type: "text" | "voice";
    }) => {
      return await pb
        .collection("channels")
        .create<Channel>({ name, server: serverId, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(serverId),
      });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      name,
    }: {
      channelId: string;
      name: string;
    }) => {
      return await pb.collection("channels").update(channelId, { name });
    },
    onSuccess: (_data, { channelId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.detail(channelId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(_data.server),
      });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
    }: {
      serverId: string;
      channelId: string;
    }) => {
      return await pb.collection("channels").delete(channelId);
    },
    onSuccess: (_data, { serverId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(serverId),
      });
    },
  });
}
