import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { useMessages } from "../hooks/useMessages";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSendMessage } from "../hooks/useSendMessage";
import { queryKeys } from "../lib/querykeys";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useServerMembers } from "../hooks/useServerMembers";
import { ArrowUp, Hash, Plus, Volume2, X } from "lucide-react";
import { MessageItem } from "../components/MessageItem";

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
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!content.trim() && !file) return;

    sendMessage.mutate({ content, channelId, file });
    setContent("");
    setFile(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

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
          messages.map((m) => <MessageItem message={m} />)
        ) : (
          <p>No messages yet. Start the conversation!</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="mb-1 h-4 text-xs text-gray-400 italic">
        {renderTypingText(typingNames)}
      </div>

      {file && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-zinc-200 p-2 text-xs">
          <img
            src={previewUrl || ""}
            alt="Upload preview"
            className="size-12 rounded border border-zinc-200 object-cover"
          />

          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-zinc-700">
              {file.name}
            </span>

            <span className="text-zinc-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            className="ml-auto text-zinc-400 hover:text-red-500"
          >
            <X className="size-4 shrink-0" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
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
            disabled={sendMessage.isPending || content.trim() === ""}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 disabled:opacity-50 disabled:hover:cursor-not-allowed"
          >
            <ArrowUp className="size-5 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
}
