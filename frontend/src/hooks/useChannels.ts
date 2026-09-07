import { useQuery } from "@tanstack/react-query";
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
