import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function useServers() {
  return useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      const memberships = await pb.collection("server_members").getFullList({
        filter: `user = "${pb.authStore.record?.id}"`,
        expand: "server",
      });
      return memberships.map((m) => m.expand?.server).filter(Boolean);
    },
  });
}
