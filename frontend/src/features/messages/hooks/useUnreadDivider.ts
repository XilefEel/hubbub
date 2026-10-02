import { useMemo, useState } from "react";
import { pb } from "@/lib/pocketbase";
import type { DateTime, Message } from "@/lib/types";
import { isAfter } from "@/lib/utils";

export function useUnreadDivider({
  messages,
  scopeId,
  lastReadAt,
  ready,
}: {
  messages: Message[] | undefined;
  scopeId: string;
  lastReadAt: DateTime | undefined;
  ready: boolean;
}) {
  const userId = pb.authStore.record?.id;
  const [captured, setCaptured] = useState<{
    scopeId: string;
    at: DateTime | null;
  } | null>(null);

  if (ready && captured?.scopeId !== scopeId) {
    setCaptured({ scopeId, at: lastReadAt ?? null });
  }

  const dividerAt = captured?.scopeId === scopeId ? captured.at : null;

  return useMemo(() => {
    if (dividerAt === null || !messages) return null;

    if (
      messages.some((m) => isAfter(m.created, dividerAt) && m.user === userId)
    ) {
      return null;
    }

    return (
      messages.find((m) => isAfter(m.created, dividerAt) && m.user !== userId)
        ?.id ?? null
    );
  }, [messages, dividerAt, userId]);
}
