import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import type { Message, MessageScope } from "@/lib/types";
import { groupReactionsByMessage, isSameGroup } from "@/lib/utils";
import { useReactions } from "../hooks/useReactions";
import {
  useChannelReads,
  useMarkChannelRead,
} from "../../channels/hooks/useReadStates";
import { useChannelFocus } from "../../channels/hooks/useChannelFocus";
import { pb } from "@/lib/pocketbase";

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
  const userId = pb.authStore.record?.id;

  const { data: reactions } = useReactions(scope.id);
  const { data: reads } = useChannelReads();

  const readState = reads?.get(scope.id);
  const [dividerAt, setDividerAt] = useState<string | null>(null);
  const capturedFor = useRef<string | null>(null);

  const firstUnreadId = useMemo(() => {
    if (dividerAt === null || !messages) return null;

    const sentSince = messages.some(
      (m) => m.created > dividerAt && m.user === userId,
    );
    if (sentSince) return null;

    return (
      messages.find((m) => m.created > dividerAt && m.user !== userId)?.id ??
      null
    );
  }, [messages, dividerAt, userId]);

  const reactionsByMessage = useMemo(
    () => groupReactionsByMessage(reactions),
    [reactions],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

  const { atBottom } = useChannelFocus(messagesEndRef, scope.id);

  const markRead = useMarkChannelRead();
  const lastMessage = messages?.at(-1);
  const lastId = lastMessage?.id;
  const newestMessage = lastMessage?.created;

  useEffect(() => {
    scrollToBottom();
  }, [scope.id]);

  useEffect(() => {
    if (!reads) return;
    if (capturedFor.current === scope.id) return;

    capturedFor.current = scope.id;
    setDividerAt(readState?.lastReadAt ?? null);
  }, [scope.id, reads, readState]);

  useEffect(() => {
    if (!lastId) return;

    const isOwn = lastMessage?.user === userId;
    if (!atBottom && !isOwn) return;

    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId]);

  useEffect(() => {
    if (scope.type !== "channel") return;
    if (!newestMessage || !atBottom) return;
    markRead.mutate({ channelId: scope.id, lastReadAt: newestMessage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.id, newestMessage, atBottom]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {messages && messages.length > 0
        ? messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : undefined;
            const showHeader = !isSameGroup(prevMessage, message);

            const showDivider = message.id === firstUnreadId;

            return (
              <Fragment key={message.id}>
                {showDivider && (
                  <div className="my-2 flex items-center gap-2 px-4">
                    <div className="h-px flex-1 bg-red-500/60" />
                    <span className="text-xs font-semibold text-red-500">
                      New
                    </span>
                    <div className="h-px flex-1 bg-red-500/60" />
                  </div>
                )}

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

      <div ref={messagesEndRef} />
    </div>
  );
}
