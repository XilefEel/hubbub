import { useEffect, useMemo, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Message, Reaction } from "../../lib/types";

function isSameGroup(
  prev: Message | undefined,
  curr: Message,
  minutesWindow = 5,
) {
  if (!prev) return false;
  if (prev.user !== curr.user) return false;

  const diffInMinutes =
    (new Date(curr.created).getTime() - new Date(prev.created).getTime()) /
    (1000 * 60);

  return diffInMinutes <= minutesWindow;
}

export function MessageList({
  messages,
  channelId,
  onReply,
  onToggleReaction,
  reactions,
}: {
  messages: Message[] | undefined;
  channelId: string;
  onReply: (message: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  reactions: Reaction[] | undefined;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const reactionsByMessage = useMemo(() => {
    const map = new Map<string, Reaction[]>();

    for (const r of reactions ?? []) {
      const existing = map.get(r.message) ?? [];
      existing.push(r);
      map.set(r.message, existing);
    }
    return map;
  }, [reactions]);

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
              showHeader={showHeader}
              onReply={onReply}
              onToggleReaction={onToggleReaction}
              reactions={reactionsByMessage.get(message.id) ?? []}
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
