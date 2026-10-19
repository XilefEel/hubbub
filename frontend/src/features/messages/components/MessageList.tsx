import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import MessageItem from "./MessageItem";
import type { Message, MessageScope } from "@/lib/types";
import { groupReactionsByMessage, isSameGroup } from "@/lib/utils";
import { useReactions } from "../hooks/useReactions";
import { useMessageFocus } from "../hooks/useMessageFocus";
import { useStickyScroll } from "../hooks/useStickyScroll";
import { useUnreadDivider } from "../hooks/useUnreadDivider";
import UnreadDivider from "./UnreadDivider";
import type { ReadMarker } from "../hooks/useReadMarker";

export default function MessageList({
  messages,
  scope,
  readMarker,
  onReply,
  emptyState,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  messages: Message[] | undefined;
  scope: MessageScope;
  readMarker: ReadMarker;
  onReply: (message: Message) => void;
  emptyState?: React.ReactNode;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
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

  const { lastReadAt, markAsRead, ready } = readMarker;

  const firstUnreadId = useUnreadDivider({
    messages,
    lastReadAt,
    ready,
    scopeId: scope.id,
  });

  useStickyScroll(endRef, scope.id, last, atBottom);

  useEffect(() => {
    if (!ready || !newestMessage || !atBottom) return;
    if (lastReadAt && newestMessage <= lastReadAt) return;
    markAsRead(newestMessage);
  }, [ready, newestMessage, atBottom, lastReadAt, markAsRead]);

  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        prevScrollHeight.current = containerRef.current?.scrollHeight ?? 0;
        fetchNextPage();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c || !prevScrollHeight.current) return;
    c.scrollTop += c.scrollHeight - prevScrollHeight.current;
    prevScrollHeight.current = 0;
  }, [messages?.length]);

  return (
    <div
      style={{ scrollbarGutter: "stable", overflowAnchor: "none" }}
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto pt-3"
      data-editor-scroll-container
    >
      <div ref={topRef} />

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
