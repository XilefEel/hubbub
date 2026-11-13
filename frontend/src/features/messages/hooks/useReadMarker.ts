import { useCallback, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import type { ConversationMember, DateTime } from "@/lib/types";
import {
  useChannelReads,
  useMarkChannelRead,
} from "@/features/channels/hooks/useReadStates";
import { useMarkConversationRead } from "@/features/conversations/hooks/useConversations";
import { isAfter } from "@/lib/utils";

export type ReadMarker = {
  lastReadAt: DateTime | undefined;
  markAsRead: (newest: DateTime) => void;
  ready: boolean;
};

export function useChannelReadMarker(channelId: string): ReadMarker {
  const { data: reads } = useChannelReads();
  const { mutate } = useMarkChannelRead();

  const lastReadAt = reads?.get(channelId)?.lastReadAt;
  const lastSentRef = useRef<{ channelId: string; at: DateTime } | null>(null);

  const markAsRead = useCallback(
    (newest: DateTime) => {
      if (lastReadAt && !isAfter(newest, lastReadAt)) return;

      const sent = lastSentRef.current;
      if (sent?.channelId === channelId && !isAfter(newest, sent.at)) return;

      lastSentRef.current = { channelId, at: newest };
      mutate({ channelId, lastReadAt: newest });
    },
    [channelId, lastReadAt, mutate],
  );

  return { lastReadAt, markAsRead, ready: !!reads };
}

export function useConversationReadMarker(
  members: ConversationMember[] | undefined,
): ReadMarker {
  const userId = pb.authStore.record?.id;
  const { mutate } = useMarkConversationRead();

  const me = members?.find((m) => m.user === userId);

  const markAsRead = useCallback(
    (newest: DateTime) => {
      if (!me) return;
      if (me.lastReadAt && !isAfter(newest, me.lastReadAt)) return;
      mutate({ memberId: me.id, lastReadAt: newest });
    },
    [me, mutate],
  );

  return {
    lastReadAt: me?.lastReadAt,
    markAsRead,
    ready: !!members,
  };
}
