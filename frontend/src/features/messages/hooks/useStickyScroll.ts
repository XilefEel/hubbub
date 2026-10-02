import { useEffect, type RefObject } from "react";
import { pb } from "@/lib/pocketbase";
import type { Message } from "@/lib/types";

export function useStickyScroll(
  endRef: RefObject<HTMLDivElement | null>,
  scopeId: string,
  last: Message | undefined,
  atBottom: boolean,
) {
  const userId = pb.authStore.record?.id;

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "auto" });

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId]);

  useEffect(() => {
    if (!last) return;
    if (!atBottom && last.user !== userId) return;
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.id]);
}
