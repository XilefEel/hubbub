import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { useMessages } from "../hooks/useMessages";
import { useEffect, useRef, useState } from "react";
import { useSendMessage } from "../hooks/useSendMessage";
import { queryKeys } from "../lib/querykeys";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useServerMembers } from "../hooks/useServerMembers";
import { ArrowUp, Hash, Plus, Volume2 } from "lucide-react";

export const Route = createFileRoute("/servers/$serverId/channels/$channelId")({
  component: ChannelPage,
});

function renderTypingText(typingNames: string[]) {
  if (typingNames.length === 0) return "";
  if (typingNames.length === 1) return `${typingNames[0]} is typing...`;
  if (typingNames.length === 2)
    return `${typingNames[0]} and ${typingNames[1]} are typing...`;

  return `${typingNames[0]}, ${typingNames[1]}, and ${
    typingNames.length - 2
  } others are typing...`;
}

function ChannelPage() {
  const { serverId, channelId } = Route.useParams();
  const [content, setContent] = useState("");

  const {
    data: channel,
    isLoading: channelLoading,
    error: channelError,
  } = useQuery<Channel>({
    queryKey: queryKeys.channels.detail(channelId),
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
    enabled: !!channelId,
  });

  const { data: members } = useServerMembers(serverId);

  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(channelId);

  const { typingUserIds, sendTyping } = useTypingIndicator(channelId);

  const sendMessage = useSendMessage();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessage.mutate({ content, channelId });
    setContent("");
  };

  const typingNames = typingUserIds
    .map(
      (id) =>
        members?.find((m) => m.user === id)?.expand?.user?.name || "Someone",
    )
    .filter(Boolean);

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

  if (channelLoading) return <p className="p-8">Loading channel...</p>;

  if (channelError)
    return (
      <p className="p-8 text-red-500">Channel not found or access denied</p>
    );

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        {channel?.type === "voice" ? (
          <Volume2 className="size-5 shrink-0" />
        ) : (
          <Hash className="size-5 shrink-0" />
        )}
        {channel?.name}
      </h2>

      {messagesLoading && <p>Loading messages...</p>}

      {messagesError && (
        <p className="text-red-500">
          Error loading messages: {messagesError.message}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className="flex items-center gap-4 rounded-lg px-2 py-1 hover:bg-zinc-50"
            >
              <div className="size-10 rounded-full bg-teal-100" />
              <div>
                <p className="font-semibold">
                  {message.expand?.user?.name || "Unknown User"}
                </p>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet. Start the conversation!</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="mb-1 h-4 text-xs text-gray-400 italic">
        {renderTypingText(typingNames)}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <button
            type="button"
            className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500"
          >
            <Plus className="size-5 shrink-0" />
          </button>

          <input
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              sendTyping();
            }}
            placeholder="Type a message..."
            className="w-full rounded-xl border border-zinc-200 px-12 py-2 outline-none focus:outline-none"
          />

          <button
            type="submit"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500"
          >
            <ArrowUp className="size-5 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
}
