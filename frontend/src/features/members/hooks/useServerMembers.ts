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
      }),
    enabled: !!serverId,
  });
}

export function useCurrentMember(serverId: string) {
  const { data: members } = useServerMembers(serverId);
  const userId = pb.authStore.record?.id;
  return members?.find((m) => m.user === userId) ?? null;
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
