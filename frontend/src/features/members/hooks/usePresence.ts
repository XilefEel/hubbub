import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { Collections } from "@/lib/collections";

export type PresenceStatus = "online" | "invisible";

export function useOnlineUserIds() {
  const { data } = useQuery({
    queryKey: queryKeys.presence.online(),
    queryFn: () => [] as string[],
    enabled: false,
    staleTime: Infinity,
  });
  return data ?? [];
}

async function sendHeartbeat(queryClient: QueryClient) {
  try {
    const res = await pb.send<{ online?: string[] }>(
      "/api/presence/heartbeat",
      { method: "POST" },
    );
    if (Array.isArray(res.online)) {
      queryClient.setQueryData<string[]>(
        queryKeys.presence.online(),
        res.online,
      );
    }
  } catch (err) {
    console.warn("heartbeat failed:", err);
  }
}

export function usePresence() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.presence.online();
    const setOnline = (ids: string[]) =>
      queryClient.setQueryData<string[]>(key, ids);

    sendHeartbeat(queryClient);
    const interval = setInterval(() => sendHeartbeat(queryClient), 15_000);

    const unsubPromise = pb.realtime.subscribe(
      "global_presence",
      (e: { type?: string; online?: string[] }) => {
        if (e.type === "presence_update" && Array.isArray(e.online)) {
          setOnline(e.online);
        }
      },
    );

    unsubPromise.catch((err) =>
      console.warn("presence subscription failed:", err),
    );

    return () => {
      clearInterval(interval);
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [userId, queryClient]);
}

export function useSetPresenceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: PresenceStatus) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Not authenticated");

      await pb
        .collection(Collections.Users)
        .update(userId, { presenceStatus: status });
    },
    onSuccess: () => sendHeartbeat(queryClient),
  });
}

export function useMyPresenceStatus() {
  const [status, setStatus] = useState<PresenceStatus>(
    pb.authStore.record?.presenceStatus || "online",
  );

  useEffect(
    () =>
      pb.authStore.onChange((_, record) => {
        setStatus(record?.presenceStatus || "online");
      }),
    [],
  );

  return status;
}
