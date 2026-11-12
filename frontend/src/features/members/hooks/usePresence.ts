import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

export function useOnlineUserIds() {
  const { data } = useQuery({
    queryKey: queryKeys.presence.online(),
    queryFn: () => [] as string[],
    enabled: false,
    staleTime: Infinity,
  });
  return data ?? [];
}

export function usePresence() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.presence.online();
    const setOnline = (ids: string[]) =>
      queryClient.setQueryData<string[]>(key, ids);

    const sendHeartbeat = async () => {
      try {
        const res = await pb.send<{ online?: string[] }>(
          "/api/presence/heartbeat",
          { method: "POST" },
        );
        if (Array.isArray(res.online)) setOnline(res.online);
      } catch (err) {
        console.warn("heartbeat failed:", err);
      }
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 15_000);

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
