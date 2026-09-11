import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Server } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10);
}

export function useServers() {
  const userId = pb.authStore.record?.id;

  return useQuery<Server[]>({
    queryKey: queryKeys.servers.list(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return await pb.collection("servers").getFullList<Server>();
    },
    enabled: !!userId,
  });
}

export function useServerDetail(serverId: string) {
  return useQuery<Server>({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: () => pb.collection("servers").getOne<Server>(serverId),
    enabled: !!serverId,
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      return await pb.collection("servers").create<Server>({
        name,
        owner: userId,
        inviteCode: generateInviteCode(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
  });
}

export function useJoinServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      return await pb.send("/api/servers/join", {
        method: "POST",
        body: { inviteCode },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
  });
}
