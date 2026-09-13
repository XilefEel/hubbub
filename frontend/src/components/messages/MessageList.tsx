import { useEffect, useMemo, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Channel, Message } from "../../lib/types";
import { groupReactionsByMessage, isSameGroup } from "../../lib/utils";
import { useReactions } from "../../hooks/useReactions";
import { Hash } from "lucide-react";

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

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [channel.id]);

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
          <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100">
            <Hash className="size-10 text-zinc-700" />
          </div>

          <h1 className="text-3xl font-bold">Welcome to #{channel.name}!</h1>
          <p className="text-sm text-zinc-500">
            This is the start of the #{channel.name} channel.
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
