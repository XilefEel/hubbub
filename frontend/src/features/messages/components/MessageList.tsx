import { Fragment, useEffect, useMemo, useRef } from "react";
import MessageItem from "./MessageItem";
import type { Message, MessageScope } from "@/lib/types";
import { groupReactionsByMessage, isSameGroup } from "@/lib/utils";
import { useReactions } from "../hooks/useReactions";
import { useMessageFocus } from "../hooks/useMessageFocus";
import { useReadMarker } from "../hooks/useReadMarker";
import { useStickyScroll } from "../hooks/useStickyScroll";
import { useUnreadDivider } from "../hooks/useUnreadDivider";
import UnreadDivider from "./UnreadDivider";

export default function MessageList({
  messages,
  scope,
  onReply,
  emptyState,
}: {
  messages: Message[] | undefined;
  scope: MessageScope;
  onReply: (message: Message) => void;
  emptyState?: React.ReactNode;
}) {
  const last = messages?.at(-1);
  const newestMessage = last?.created;
  const endRef = useRef<HTMLDivElement>(null);

  const { atBottom } = useMessageFocus(endRef, scope.id);

  const { data: reactions } = useReactions(scope);
  const reactionsByMessage = useMemo(
    () => groupReactionsByMessage(reactions),
    [reactions],
  );

  const { lastReadAt, markAsRead, ready } = useReadMarker(scope);

  const firstUnreadId = useUnreadDivider({
    messages,
    lastReadAt,
    ready,
    scopeId: scope.id,
  });

  useStickyScroll(endRef, scope.id, last, atBottom);

  useEffect(() => {
    if (!newestMessage || !atBottom) return;
    markAsRead(newestMessage);
  }, [newestMessage, atBottom, markAsRead]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-3">
      {messages && messages.length > 0
        ? messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : undefined;
            const showHeader = !isSameGroup(prevMessage, message);
            const showDivider = message.id === firstUnreadId;

            return (
              <Fragment key={message.id}>
                {showDivider && <UnreadDivider />}

                <MessageItem
                  message={message}
                  reactions={reactionsByMessage.get(message.id) ?? []}
                  showHeader={showHeader}
                  onReply={onReply}
                />
              </Fragment>
            );
          })
        : emptyState}

      <div ref={endRef} />
    </div>
  );
}
