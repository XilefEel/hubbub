import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { pb } from "@/lib/pocketbase";
import type { ServerMember } from "@/lib/types";

export function useTypingIndicator(
  channelId: string,
  members: ServerMember[] | undefined,
) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastEmittedRef = useRef<number>(0);

  useEffect(() => {
    if (!channelId) return;

    const unsubPromise = pb.realtime.subscribe(
      `channel_${channelId}`,
      (e: { name: string; type: string; userId: string }) => {
        if (e.type !== "typing" || !e.userId) return;

        const userId = e.userId;

        setTypingUserIds((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        );

        if (timeoutsRef.current[userId]) {
          clearTimeout(timeoutsRef.current[userId]);
        }

        timeoutsRef.current[userId] = setTimeout(() => {
          setTypingUserIds((prev) => prev.filter((id) => id !== userId));
          delete timeoutsRef.current[userId];
        }, 3000);
      },
    );

    unsubPromise.catch((err) =>
      console.warn("typing subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
      setTypingUserIds([]);
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

  const typingNames = useMemo(
    () =>
      typingUserIds.map(
        (id) =>
          members?.find((m) => m.user === id)?.expand?.user?.name || "Someone",
      ),
    [typingUserIds, members],
  );

  return { typingNames, sendTyping };
}
