import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Server } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";

export function useServers() {
  const userId = pb.authStore.record?.id;

  return useQuery<Server[]>({
    queryKey: queryKeys.servers.byUser(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return await pb.collection("servers").getFullList<Server>();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export const serverDetailOptions = (serverId: string) =>
  queryOptions({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: () => pb.collection("servers").getOne<Server>(serverId),
    staleTime: 1000 * 30,
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
    mutationFn: ({ name }: { name: string }) =>
      pb.collection("servers").create<Server>({ name }),
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

      return pb.collection("servers").update(serverId, formData);
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
        .collection("server_members")
        .getFirstListItem(`user="${userId}" && server="${serverId}"`);

      return pb.collection("server_members").delete(membership.id);
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
    mutationFn: (serverId: string) => pb.collection("servers").delete(serverId),
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
    staleTime: 1000 * 60 * 5,
  });

  const { data: myServers } = useServers();
  const serverIds = new Set(data?.servers ?? []);

  return myServers?.filter((s) => serverIds.has(s.id)) ?? [];
}
