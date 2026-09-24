import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";

export function usePresence() {
  const myId = pb.authStore.record?.id;

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>(() =>
    myId ? [myId] : [],
  );

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    const sendHeartbeat = async () => {
      try {
        const res = await pb.send<{ online?: string[] }>(
          "/api/presence/heartbeat",
          {
            method: "POST",
          },
        );

        if (Array.isArray(res.online)) setOnlineUserIds(res.online);
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
          setOnlineUserIds(e.online);
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
  }, []);

  return { onlineUserIds };
}
