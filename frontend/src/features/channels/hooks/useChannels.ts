import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Channel } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useEffect } from "react";

export function useChannels(serverId: string) {
  return useQuery<Channel[]>({
    queryKey: queryKeys.channels.byServer(serverId),
    queryFn: () =>
      pb.collection("channels").getFullList<Channel>({
        filter: pb.filter("server = {:id}", { id: serverId }),
        sort: "type,name",
      }),
    enabled: !!serverId,
  });
}

export function useChannelsSubscription(serverId: string) {
  const queryClient = useQueryClient();

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
              return old
                .map((c) => (c.id === e.record.id ? e.record : c))
                .sort(byTypeThenName);
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
      console.warn("channels subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient, serverId]);
}

const byTypeThenName = (a: Channel, b: Channel) =>
  a.type.localeCompare(b.type) || a.name.localeCompare(b.name);

export function useChannelDetail(channelId: string, serverId: string) {
  const queryClient = useQueryClient();

  return useQuery<Channel>({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
    placeholderData: () =>
      queryClient
        .getQueryData<Channel[]>(queryKeys.channels.byServer(serverId))
        ?.find((c) => c.id === channelId),
    enabled: !!channelId,
  });
}

export function useMyChannels() {
  const userId = pb.authStore.record?.id;

  return useQuery<Channel[]>({
    queryKey: queryKeys.channels.byUser(userId),
    queryFn: () =>
      pb.collection("channels").getFullList<Channel>({
        filter: pb.filter("server.server_members_via_server.user ?= {:me}", {
          me: userId,
        }),
      }),
    enabled: !!userId,
  });
}

export function useMyChannelsSubscription() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;
    const key = queryKeys.channels.byUser(userId);

    const unsubPromise = pb
      .collection("channels")
      .subscribe<Channel>("*", (e) => {
        if (e.action === "create") {
          queryClient.invalidateQueries({ queryKey: key });
          return;
        }

        queryClient.setQueryData<Channel[]>(key, (old) => {
          if (!old || !old.some((c) => c.id === e.record.id)) return old;

          switch (e.action) {
            case "update":
              return old.map((c) => (c.id === e.record.id ? e.record : c));
            case "delete":
              return old.filter((c) => c.id !== e.record.id);
            default:
              return old;
          }
        });
      });

    unsubPromise.catch((err) =>
      console.warn("my channels subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient, userId]);
}

export function useCreateChannel(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, type }: { name: string; type: "text" | "voice" }) =>
      pb
        .collection("channels")
        .create<Channel>({ name, server: serverId, type }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.all() }),
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, name }: { channelId: string; name: string }) =>
      pb.collection("channels").update(channelId, { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.all() }),
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId }: { channelId: string }) =>
      pb.collection("channels").delete(channelId),
    onSuccess: (_, { channelId }) => {
      queryClient.removeQueries({
        queryKey: queryKeys.channels.detail(channelId),
      });
      return queryClient.invalidateQueries({
        queryKey: queryKeys.channels.all(),
      });
    },
  });
}
