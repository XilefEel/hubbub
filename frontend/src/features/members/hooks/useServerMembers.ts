import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { ServerMember } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";

export function useServerMembers(serverId: string) {
  return useQuery<ServerMember[]>({
    queryKey: queryKeys.serverMembers.byServer(serverId),
    queryFn: () =>
      pb.collection("server_members").getFullList<ServerMember>({
        filter: pb.filter("server = {:id}", { id: serverId }),
        expand: "user",
        sort: "role",
      }),
    enabled: !!serverId,
  });
}

export function useUpdateMemberRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      membershipId,
      role,
    }: {
      membershipId: string;
      role: "admin" | "member";
    }) => pb.collection("server_members").update(membershipId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.byServer(serverId),
      });
    },
  });
}

export function useBanMember(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      pb.collection("server_members").delete(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.byServer(serverId),
      });
    },
  });
}
