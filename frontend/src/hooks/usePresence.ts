import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";

export function usePresence() {
  const myId = pb.authStore.record?.id;

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>(() =>
    myId ? [myId] : [],
  );

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    const sendHeartbeat = () => {
      pb.send("/api/presence/heartbeat", { method: "POST" }).catch((err) => {
        console.warn("heartbeat failed:", err);
      });
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20_000);

    let cancelled = false;
    let unsub: (() => void) | undefined;

    const topic = "global_presence";

    // Subscribe to real-time updates for presence changes
    pb.realtime
      .subscribe(topic, (e: { type?: string; online?: string[] }) => {
        if (e.type === "presence_update" && Array.isArray(e.online)) {
          setOnlineUserIds(e.online);
        }
      })
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("heartbeat failed:", err));

    return () => {
      cancelled = true;
      clearInterval(interval);
      unsub?.();
    };
  }, []);

  return { onlineUserIds };
}
