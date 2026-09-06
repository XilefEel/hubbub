import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Server } from "../lib/types";

// fetches all servers that the user is a member of
export function useServers() {
  const userId = pb.authStore.record?.id;

  return useQuery<Server[]>({
    queryKey: ["servers", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await pb.collection("servers").getFullList<Server>();
    },
    enabled: !!userId,
  });
}
