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
import { PRESENCE_STATUSES, type PresenceStatus } from "@/lib/types";

type OnlineMap = Record<string, PresenceStatus>;
const EMPTY = {} as OnlineMap;

export function useOnlineUsers() {
  const { data } = useQuery({
    queryKey: queryKeys.presence.online(),
    queryFn: () => EMPTY,
    enabled: false,
    staleTime: Infinity,
  });
  return data ?? EMPTY;
}

const isOnlineMap = (data: unknown): data is OnlineMap =>
  typeof data === "object" &&
  data !== null &&
  !Array.isArray(data) &&
  Object.values(data).every((v) =>
    PRESENCE_STATUSES.includes(v as PresenceStatus),
  );

async function sendHeartbeat(queryClient: QueryClient) {
  try {
    const res = await pb.send<{ online?: OnlineMap }>(
      "/api/presence/heartbeat",
      { method: "POST" },
    );
    if (isOnlineMap(res.online)) {
      queryClient.setQueryData<OnlineMap>(
        queryKeys.presence.online(),
        res.online,
      );
    } else {
      console.warn("unexpected presence payload:", res.online);
    }
  } catch (err) {
    console.warn("heartbeat failed:", err);
  }
}

export function usePresenceSubscription() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.presence.online();
    const setOnline = (m: OnlineMap) =>
      queryClient.setQueryData<OnlineMap>(key, m);

    sendHeartbeat(queryClient);
    const interval = setInterval(() => sendHeartbeat(queryClient), 15_000);

    const unsubPromise = pb.realtime.subscribe(
      "global_presence",
      (e: { type?: string; online?: OnlineMap }) => {
        if (e.type === "presence_update" && isOnlineMap(e.online)) {
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
