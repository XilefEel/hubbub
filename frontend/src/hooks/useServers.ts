import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Server } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

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
