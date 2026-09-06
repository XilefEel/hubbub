import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function useServerMembers(serverId: string) {
  return useQuery({
    queryKey: ["server_members", serverId],
    queryFn: async () => {
      return await pb.collection("server_members").getFullList({
        filter: `server = "${serverId}"`,
        expand: "user",
        sort: "role",
      });
    },
    enabled: !!serverId,
  });
}
