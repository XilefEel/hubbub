import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { ServerMember } from "../lib/types";

export function useServerMembers(serverId: string) {
  return useQuery<ServerMember[]>({
    queryKey: ["server_members", serverId],
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
