import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { Collections } from "@/lib/collections";
import type { ServerMember } from "@/lib/types";
import { useEffect } from "react";

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

export function useServerMembersSubscription(serverId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!serverId) return;

    const key = queryKeys.serverMembers.byServer(serverId);
    const unsubPromise = pb
      .collection(Collections.ServerMembers)
      .subscribe<ServerMember>(
        "*",
        (e) => {
          queryClient.setQueryData<ServerMember[]>(key, (old) => {
            if (!old) return old;
            switch (e.action) {
              case "create":
                return old.some((m) => m.id === e.record.id)
                  ? old
                  : [...old, e.record];
              case "update":
                return old.map((m) =>
                  m.id === e.record.id
                    ? { ...m, ...e.record, expand: m.expand }
                    : m,
                );
              case "delete":
                return old.filter((m) => m.id !== e.record.id);
              default:
                return old;
            }
          });
        },
        { filter: pb.filter("server = {:id}", { id: serverId }) },
      );

    unsubPromise.catch((err) =>
      console.warn("server members subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient, serverId]);
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
