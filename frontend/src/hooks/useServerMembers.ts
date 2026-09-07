import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { ServerMember } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

export function useServerMembers(serverId: string) {
  return useQuery<ServerMember[]>({
    queryKey: queryKeys.serverMembers.list(serverId),
    queryFn: async () => {
      return await pb.collection("server_members").getFullList<ServerMember>({
        filter: `server = "${serverId}"`,
        expand: "user",
        sort: "role",
      });
    },
    enabled: !!serverId,
  });
}
