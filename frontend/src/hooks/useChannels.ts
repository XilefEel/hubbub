import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";

export function useChannels(serverId: string) {
  return useQuery<Channel[]>({
    queryKey: ["channels", serverId],
    queryFn: async () => {
      return await pb.collection("channels").getFullList<Channel>({
        filter: `server = "${serverId}"`,
        sort: "name",
      });
    },
    enabled: !!serverId,
  });
}
