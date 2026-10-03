import { useCallback, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import type { DateTime, MessageScope } from "@/lib/types";
import {
  useChannelReads,
  useMarkChannelRead,
} from "@/features/channels/hooks/useReadStates";
import {
  useConversationMembers,
  useMarkConversationRead,
} from "@/features/conversations/hooks/useConversationMembers";

export function useReadMarker(scope: MessageScope) {
  const userId = pb.authStore.record?.id;
  const isChannel = scope.type === "channel";

  const { data: reads } = useChannelReads();
  const { data: members } = useConversationMembers(isChannel ? "" : scope.id);

  const me = members?.find((m) => m.user === userId);
  const myId = me?.id;

  // extract the mutate functions from the hooks to prevent unnecessary re-renders
  const markChannel = useMarkChannelRead().mutate;
  const markConversation = useMarkConversationRead().mutate;

  const ready = isChannel ? !!reads : !!members;

  const lastReadAt = isChannel
    ? reads?.get(scope.id)?.lastReadAt
    : members?.find((m) => m.user === userId)?.lastReadAt;

  const lastMarked = useRef<string | null>(null);

  const markAsRead = useCallback(
    (newest: DateTime) => {
      const key = `${scope.id}:${newest}`;
      if (lastMarked.current === key) return;
      lastMarked.current = key;

      if (isChannel) {
        markChannel({ channelId: scope.id, lastReadAt: newest });
      } else if (myId) {
        markConversation({ memberId: myId, lastReadAt: newest });
      }
    },
    [isChannel, scope.id, myId, markChannel, markConversation],
  );

  return { lastReadAt, markAsRead, ready };
}
