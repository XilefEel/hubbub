import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Server } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10);
}

export function useServers() {
  const userId = pb.authStore.record?.id;

  return useQuery<Server[]>({
    queryKey: queryKeys.servers.list(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return await pb.collection("servers").getFullList<Server>();
    },
    enabled: !!userId,
  });
}

export function useServerDetail(serverId: string) {
  return useQuery<Server>({
    queryKey: queryKeys.servers.detail(serverId),
    queryFn: () => pb.collection("servers").getOne<Server>(serverId),
    enabled: !!serverId,
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      return await pb.collection("servers").create<Server>({
        name,
        owner: userId,
        inviteCode: generateInviteCode(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
  });
}

export function useJoinServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      return await pb.send("/api/servers/join", {
        method: "POST",
        body: { inviteCode },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
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

      return await pb.collection("servers").update(serverId, formData);
    },
    onSuccess: (_, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.detail(serverId),
      });
      queryClient.invalidateQueries({ queryKey: ["server_members"] });
    },
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

      return await pb.collection("server_members").delete(membership.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
  });
}

export function useDeleteServer() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async (serverId: string) => {
      return await pb.collection("servers").delete(serverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.servers.list(userId || ""),
      });
    },
  });
}
