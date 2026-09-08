import { useEffect, useState, useRef, useCallback } from "react";
import { pb } from "../lib/pocketbase";

export function useTypingIndicator(channelId: string) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastEmittedRef = useRef<number>(0);

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    const topic = `channel_${channelId}`;

    // Subscribe to real-time updates for typing events
    pb.realtime
      .subscribe(topic, (e: { name: string; type: string; userId: string }) => {
        if (e.type !== "typing" || !e.userId) return;

        const userId = e.userId;

        setTypingUserIds((prev) => {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        });

        if (timeoutsRef.current[userId]) {
          clearTimeout(timeoutsRef.current[userId]);
        }

        timeoutsRef.current[userId] = setTimeout(() => {
          setTypingUserIds((prev) => prev.filter((id) => id !== userId));
          delete timeoutsRef.current[userId];
        }, 3000);
      })
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("typing subscription failed:", err));

    return () => {
      pb.realtime.unsubscribe(topic);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
      setTypingUserIds([]);
      cancelled = true;
      unsub?.();
    };
  }, [channelId]);

  const sendTyping = useCallback(() => {
    if (!channelId) return;

    const now = Date.now();
    if (now - lastEmittedRef.current < 2000) return;
    lastEmittedRef.current = now;

    pb.send(`/api/channels/${channelId}/typing`, { method: "POST" }).catch(
      (err) => console.error("typing POST failed:", err),
    );
  }, [channelId]);

  return { typingUserIds, sendTyping };
}
