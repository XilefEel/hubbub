import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { pb } from "@/lib/pocketbase";
import type {
  ConversationMember,
  MessageScope,
  ServerMember,
} from "@/lib/types";

export function useTypingIndicator(
  scope: MessageScope,
  members: ServerMember[] | ConversationMember[] | undefined,
) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastEmittedRef = useRef<number>(0);

  useEffect(() => {
    if (!scope.id) return;

    const key = `${scope.type}_${scope.id}`;

    const unsubPromise = pb.realtime.subscribe(
      key,
      (e: { type: string; userId: string }) => {
        if (!e.userId) return;

        if (e.type === "stop_typing") {
          clearTimeout(timeoutsRef.current[e.userId]);
          delete timeoutsRef.current[e.userId];
          setTypingUserIds((prev) => prev.filter((id) => id !== e.userId));
          return;
        }

        if (e.type !== "typing") return;

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
  }, [scope.type, scope.id]);

  const sendTyping = useCallback(() => {
    if (!scope.id) return;

    const now = Date.now();
    if (now - lastEmittedRef.current < 2000) return;
    lastEmittedRef.current = now;

    pb.send(`/api/${scope.type}s/${scope.id}/typing`, { method: "POST" }).catch(
      (err) => console.error("typing POST failed:", err),
    );
  }, [scope.id, scope.type]);

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
