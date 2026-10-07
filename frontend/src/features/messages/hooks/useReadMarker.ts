import { useCallback } from "react";
import { pb } from "@/lib/pocketbase";
import type { ConversationMember, DateTime } from "@/lib/types";
import {
  useChannelReads,
  useMarkChannelRead,
} from "@/features/channels/hooks/useReadStates";
import { useMarkConversationRead } from "@/features/conversations/hooks/useConversationMembers";

export type ReadMarker = {
  lastReadAt: DateTime | undefined;
  markAsRead: (newest: DateTime) => void;
  ready: boolean;
};

export function useChannelReadMarker(channelId: string): ReadMarker {
  const { data: reads } = useChannelReads();
  const { mutate } = useMarkChannelRead();

  const markAsRead = useCallback(
    (newest: DateTime) => mutate({ channelId, lastReadAt: newest }),
    [channelId, mutate],
  );

  return {
    lastReadAt: reads?.get(channelId)?.lastReadAt,
    markAsRead,
    ready: !!reads,
  };
}

export function useConversationReadMarker(
  members: ConversationMember[] | undefined,
): ReadMarker {
  const userId = pb.authStore.record?.id;
  const { mutate } = useMarkConversationRead();

  const me = members?.find((m) => m.user === userId);
  const myId = me?.id;

  const markAsRead = useCallback(
    (newest: DateTime) => {
      if (myId) mutate({ memberId: myId, lastReadAt: newest });
    },
    [myId, mutate],
  );

  return {
    lastReadAt: me?.lastReadAt,
    markAsRead,
    ready: !!members,
  };
}
