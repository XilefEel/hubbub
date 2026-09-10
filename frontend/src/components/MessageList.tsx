import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Message } from "../lib/types";

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
}: {
  messages: Message[] | undefined;
  channelId: string;
}) {
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
              showHeader={showHeader}
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
