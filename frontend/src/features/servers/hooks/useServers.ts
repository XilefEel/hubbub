import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { Collections } from "@/lib/collections";

export function useServers() {
  const userId = pb.authStore.record?.id;

  return useQuery({
    queryKey: queryKeys.servers.byUser(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return await pb.collection(Collections.Servers).getFullList();
    },
    enabled: !!userId,
  });
}

export const serverDetailOptions = (serverId: string) =>
  queryOptions({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: () => pb.collection(Collections.Servers).getOne(serverId),
  });

export function useServerDetail(serverId: string) {
  return useQuery({
    ...serverDetailOptions(serverId),
    enabled: !!serverId,
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, icon }: { name: string; icon?: File }) => {
      const formData = new FormData();
      formData.append("name", name);
      if (icon) formData.append("icon", icon);

      return pb.collection(Collections.Servers).create(formData);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all() }),
  });
}

export function useJoinServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      return await pb.send("/api/servers/join", {
        method: "POST",
        body: { inviteCode },
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.all(),
      }),
  });
}

export function useUpdateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      name,
      icon,
    }: {
      serverId: string;
      name?: string;
      icon?: File | "";
    }) => {
      const formData = new FormData();
      if (name !== undefined) formData.append("name", name);
      if (icon !== undefined) formData.append("icon", icon);

      return pb.collection(Collections.Servers).update(serverId, formData);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all() }),
  });
}

export function useLeaveServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async (serverId: string) => {
      const membership = await pb
        .collection(Collections.ServerMembers)
        .getFirstListItem(`user="${userId}" && server="${serverId}"`);

      return pb.collection(Collections.ServerMembers).delete(membership.id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.all(),
      }),
  });
}

export function useDeleteServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverId: string) =>
      pb.collection(Collections.Servers).delete(serverId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.all(),
      }),
  });
}

export function useMutualServers(targetId?: string) {
  const currentUserId = pb.authStore.record?.id;

  const { data } = useQuery({
    queryKey: queryKeys.mutualServers.byUser(targetId || ""),
    queryFn: () =>
      pb.send<{ servers: string[] }>(`/api/mutual/${targetId}`, {}),
    enabled: !!targetId && targetId !== currentUserId,
  });

  const { data: myServers } = useServers();
  const serverIds = new Set(data?.servers ?? []);

  return myServers?.filter((s) => serverIds.has(s.id)) ?? [];
}
