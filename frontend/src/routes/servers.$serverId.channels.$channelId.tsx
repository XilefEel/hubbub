import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { useMessages } from "../hooks/useMessages";
import { useState } from "react";
import { useSendMessage } from "../hooks/useSendMessage";

export const Route = createFileRoute("/servers/$serverId/channels/$channelId")({
  component: ChannelPage,
});

function ChannelPage() {
  const { channelId } = Route.useParams();
  const [content, setContent] = useState("");

  const {
    data: channel,
    isLoading: channelLoading,
    error: channelError,
  } = useQuery<Channel>({
    queryKey: ["channels", "detail", channelId],
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
    enabled: !!channelId,
  });

  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(channelId);

  const sendMessage = useSendMessage();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessage.mutate({ content, channelId });
    setContent("");
  };

  if (channelLoading) return <p className="p-8">Loading channel...</p>;

  if (channelError)
    return (
      <p className="p-8 text-red-500">Channel not found or access denied</p>
    );

  return (
    <div className="flex h-full flex-col gap-4 p-8">
      <h2 className="text-xl font-bold">
        {channel?.type === "text" ? "# " : "🔊 "}
        {channel?.name}
      </h2>

      {messagesLoading && <p>Loading messages...</p>}

      {messagesError && (
        <p className="text-red-500">
          Error loading messages: {messagesError.message}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {messages?.map((message) => (
          <div key={message.id} className="flex gap-2">
            <div>
              <p className="font-semibold">
                {message.expand?.user?.name || "Unknown User"}
              </p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded border px-4 py-2"
        />

        <button
          type="submit"
          disabled={sendMessage.isPending}
          className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600"
        >
          {sendMessage.isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
