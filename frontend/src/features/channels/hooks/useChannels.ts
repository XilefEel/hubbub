import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Channel, ChannelType } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useEffect } from "react";
import { Collections } from "@/lib/collections";

export function useChannels(serverId: string) {
  return useQuery({
    queryKey: queryKeys.channels.byServer(serverId),
    queryFn: () =>
      pb.collection(Collections.Channels).getFullList({
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
    const unsubPromise = pb.collection(Collections.Channels).subscribe(
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

export const channelDetailOptions = (channelId: string) =>
  queryOptions({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => pb.collection(Collections.Channels).getOne(channelId),
  });

export function useChannelDetail(channelId: string, serverId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    ...channelDetailOptions(channelId),
    placeholderData: () =>
      queryClient
        .getQueryData<Channel[]>(queryKeys.channels.byServer(serverId))
        ?.find((c) => c.id === channelId),
    enabled: !!channelId,
  });
}

export function useMyChannels() {
  const userId = pb.authStore.record?.id;

  return useQuery({
    queryKey: queryKeys.channels.byUser(userId),
    queryFn: () =>
      pb.collection(Collections.Channels).getFullList({
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
      .collection(Collections.Channels)
      .subscribe("*", (e) => {
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
    mutationFn: ({ name, type }: { name: string; type: ChannelType }) =>
      pb
        .collection(Collections.Channels)
        .create({ name, server: serverId, type }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.all() }),
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, name }: { channelId: string; name: string }) =>
      pb.collection(Collections.Channels).update(channelId, { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.all() }),
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId }: { channelId: string }) =>
      pb.collection(Collections.Channels).delete(channelId),
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
