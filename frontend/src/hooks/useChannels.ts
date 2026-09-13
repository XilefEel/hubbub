import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

export function useChannels(serverId: string) {
  return useQuery<Channel[]>({
    queryKey: queryKeys.channels.list(serverId),
    queryFn: async () => {
      return await pb.collection("channels").getFullList<Channel>({
        filter: `server = "${serverId}"`,
        sort: "type,name",
      });
    },
    enabled: !!serverId,
  });
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
