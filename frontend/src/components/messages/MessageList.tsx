import { useEffect, useMemo, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Channel, Message } from "../../lib/types";
import { groupReactionsByMessage, isSameGroup } from "../../lib/utils";
import { useReactions } from "../../hooks/useReactions";
import { Hash } from "lucide-react";
import { useMarkChannelRead } from "../../hooks/useReadStates";
import { useChannelFocus } from "../../hooks/useChannelFocus";
import { pb } from "../../lib/pocketbase";

export function MessageList({
  messages,
  channel,
  onReply,
}: {
  messages: Message[] | undefined;
  channel: Channel;
  onReply: (message: Message) => void;
}) {
  const { data: reactions } = useReactions(channel.id);

  const reactionsByMessage = useMemo(
    () => groupReactionsByMessage(reactions),
    [reactions],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

  const { atBottom } = useChannelFocus(messagesEndRef, channel.id);

  const markRead = useMarkChannelRead();
  const lastMessage = messages?.at(-1);
  const lastId = lastMessage?.id;
  const newestMessage = lastMessage?.created;

  useEffect(() => {
    scrollToBottom();
  }, [channel.id]);

  useEffect(() => {
    if (!lastId) return;
    const isOwn = lastMessage?.user === pb.authStore.record?.id;
    if (!atBottom && !isOwn) return;
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId]);

  useEffect(() => {
    if (!newestMessage || !atBottom) return;
    markRead.mutate({ channelId: channel.id, lastReadAt: newestMessage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id, newestMessage, atBottom]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {messages && messages.length > 0 ? (
        messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const showHeader = !isSameGroup(prevMessage, message);

          return (
            <MessageItem
              key={message.id}
              message={message}
              reactions={reactionsByMessage.get(message.id) ?? []}
              showHeader={showHeader}
              onReply={onReply}
            />
          );
        })
      ) : (
        <div className="flex flex-1 flex-col justify-end gap-2 pb-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
            <Hash className="size-10 text-zinc-700 dark:text-zinc-200" />
          </div>

          <h1 className="text-3xl font-bold">Welcome to #{channel.name}!</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This is the start of the #{channel.name} channel.
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
