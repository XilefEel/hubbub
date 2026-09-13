import { useEffect, useMemo, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Message } from "../../lib/types";
import { groupReactionsByMessage, isSameGroup } from "../../lib/utils";
import { useReactions } from "../../hooks/useReactions";

export function MessageList({
  messages,
  channelId,
  onReply,
}: {
  messages: Message[] | undefined;
  channelId: string;
  onReply: (message: Message) => void;
}) {
  const { data: reactions } = useReactions(channelId);

  const reactionsByMessage = useMemo(
    () => groupReactionsByMessage(reactions),
    [reactions],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [channelId]);

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
        <p>No messages yet. Start the conversation!</p>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
