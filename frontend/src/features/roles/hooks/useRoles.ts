import { Collections } from "@/lib/collections";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Role } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useRoles(serverId: string) {
  return useQuery({
    queryKey: queryKeys.roles.byServer(serverId),
    queryFn: () =>
      pb.collection(Collections.Roles).getFullList({
        filter: pb.filter("server = {:serverId}", { serverId }),
        sort: "-position",
      }),
  });
}

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

export function useUpdateRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      ...data
    }: {
      roleId: string;
      name: string;
      color: string;
      permissions: number;
      mentionable: boolean;
    }) =>
      pb.send<Role>(`/api/servers/${serverId}/roles/${roleId}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.byServer(serverId),
      });
    },
  });
}

export function useUpdateMemberRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      pb.send(`/api/servers/${serverId}/members/${userId}/roles/${roleId}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.byServer(serverId),
      });
    },
  });
}

export function useRemoveMemberRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      pb.send(`/api/servers/${serverId}/members/${userId}/roles/${roleId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.byServer(serverId),
      });
    },
  });
}
