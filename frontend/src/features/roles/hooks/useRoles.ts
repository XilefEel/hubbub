import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Role } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Perm = {
  Administrator: 1 << 0,
  ManageServer: 1 << 1,
  ManageChannels: 1 << 2,
  ManageRoles: 1 << 3,
  ManageMessages: 1 << 4,
  KickMembers: 1 << 5,
  BanMembers: 1 << 6,
  MentionEveryone: 1 << 7,
} as const;

export function useCreateRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      color: string;
      permissions: number;
      mentionable: boolean;
    }) =>
      pb.send<Role>(`/api/servers/${serverId}/roles`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.byServer(serverId),
      });
    },
  });
}
