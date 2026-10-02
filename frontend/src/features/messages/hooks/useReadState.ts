import { useCallback } from "react";
import { pb } from "@/lib/pocketbase";
import type { MessageScope } from "@/lib/types";
import {
  useChannelReads,
  useMarkChannelRead,
} from "@/features/channels/hooks/useReadStates";
import {
  useConversationMembers,
  useMarkConversationRead,
} from "@/features/conversations/hooks/useConversationMembers";

export function useReadState(scope: MessageScope) {
  const userId = pb.authStore.record?.id;
  const isChannel = scope.type === "channel";

  const { data: reads } = useChannelReads();
  const { data: members } = useConversationMembers(isChannel ? "" : scope.id);

  const me = members?.find((m) => m.user === userId);

  const markChannel = useMarkChannelRead();
  const markConversation = useMarkConversationRead();

  const ready = isChannel ? !!reads : !!members;

  const lastReadAt = isChannel
    ? reads?.get(scope.id)?.lastReadAt
    : members?.find((m) => m.user === userId)?.lastReadAt;

  const markRead = useCallback(
    (newest: string) => {
      if (isChannel) {
        markChannel.mutate({ channelId: scope.id, lastReadAt: newest });
      } else if (me) {
        markConversation.mutate({ memberId: me?.id, lastReadAt: newest });
      }
    },
    [isChannel, scope.id, me, markChannel, markConversation],
  );

  return { lastReadAt, markRead, ready };
}
