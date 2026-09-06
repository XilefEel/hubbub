import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { ServerMember } from "../lib/types";

// fetches all members of a server
export function useServerMembers(serverId: string) {
  return useQuery<ServerMember[]>({
    queryKey: ["server_members", serverId],
    queryFn: async () => {
      return await pb.collection("server_members").getFullList<ServerMember>({
        filter: `server = "${serverId}"`,
        expand: "user", // join the user collection to get user details
        sort: "role",
      });
    },
    enabled: !!serverId,
  });
}
