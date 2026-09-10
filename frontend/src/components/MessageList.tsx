import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { Message } from "../lib/types";

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
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {messages && messages.length > 0 ? (
        messages.map((m) => <MessageItem key={m.id} message={m} />)
      ) : (
        <p>No messages yet. Start the conversation!</p>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
