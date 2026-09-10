import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useUpdateMemberRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      role,
    }: {
      membershipId: string;
      role: "admin" | "member";
    }) => {
      return await pb
        .collection("server_members")
        .update(membershipId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.list(serverId),
      });
    },
  });
}

export function useBanMember(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      return await pb.collection("server_members").delete(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.list(serverId),
      });
    },
  });
}
