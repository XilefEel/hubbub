import { Collections } from "@/lib/collections";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Role } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Permission } from "../utils/permissions";

export function useRoles(serverId: string) {
  return useQuery({
    queryKey: queryKeys.roles.byServer(serverId),
    queryFn: () =>
      pb.collection(Collections.Roles).getFullList({
        filter: pb.filter("server = {:serverId}", { serverId }),
        sort: "position",
      }),
    enabled: !!serverId,
  });
}

export function useCreateRole(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      color: string;
      permissions: Permission;
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
      permissions: Permission;
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

export function useReorderRoles(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleIds: string[]) =>
      pb.send(`/api/servers/${serverId}/roles/reorder`, {
        method: "PUT",
        body: { roleIds },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.byServer(serverId),
      });
    },
  });
}
