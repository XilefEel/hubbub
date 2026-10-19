import { useEffect, type RefObject } from "react";
import { pb } from "@/lib/pocketbase";
import type { Message } from "@/lib/types";

export function useStickyScroll(
  endRef: RefObject<HTMLDivElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  scopeId: string,
  last: Message | undefined,
  atBottom: boolean,
) {
  const userId = pb.authStore.record?.id;

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "auto" });

  useEffect(() => {
    if (!last) return;
    if (!atBottom && last.user !== userId) return;
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let pinned = true;

    const onScroll = () => {
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      pinned = distance < 50;
    };

    const ro = new ResizeObserver(() => {
      if (pinned) scrollToBottom();
    });

    Array.from(container.children).forEach((child) => ro.observe(child));

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      container.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId]);
}
