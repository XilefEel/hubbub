import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { Collections } from "@/lib/collections";

export function useServerMembers(serverId: string) {
  return useQuery({
    queryKey: queryKeys.serverMembers.byServer(serverId),
    queryFn: () =>
      pb.collection(Collections.ServerMembers).getFullList({
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
    }) =>
      pb.collection(Collections.ServerMembers).update(membershipId, { role }),
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
      pb.collection(Collections.ServerMembers).delete(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.byServer(serverId),
      });
    },
  });
}
