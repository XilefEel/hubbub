import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Channel } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useEffect } from "react";

export function useChannels(serverId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Channel[]>({
    queryKey: queryKeys.channels.byServer(serverId),
    queryFn: async () => {
      return await pb.collection("channels").getFullList<Channel>({
        filter: pb.filter("server = {:id}", { id: serverId }),
        sort: "type,name",
      });
    },
    enabled: !!serverId,
  });

  useEffect(() => {
    if (!serverId) return;

    const key = queryKeys.channels.byServer(serverId);
    const unsubPromise = pb.collection("channels").subscribe<Channel>(
      "*",
      (e) => {
        queryClient.setQueryData<Channel[]>(key, (old) => {
          if (!old) return old;
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
        filter: pb.filter("server = {:id}", { id: serverId }),
        sort: "type,name",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("channel subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient, serverId]);

  return query;
}

export function useChannelDetail(channelId: string, serverId: string) {
  const queryClient = useQueryClient();

  return useQuery<Channel>({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
    initialData: () =>
      queryClient
        .getQueryData<Channel[]>(queryKeys.channels.byServer(serverId))
        ?.find((c) => c.id === channelId),
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
        queryKey: queryKeys.channels.all(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.all(),
      });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId }: { channelId: string }) => {
      return await pb.collection("channels").delete(channelId);
    },
    onSuccess: (_, { channelId }) => {
      queryClient.removeQueries({
        queryKey: queryKeys.channels.detail(channelId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.all(),
      });
    },
  });
}
