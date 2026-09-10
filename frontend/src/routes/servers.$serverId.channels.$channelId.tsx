import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { queryKeys } from "../lib/querykeys";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useServerMembers } from "../hooks/useServerMembers";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { TypingIndicator } from "../components/TypingIndicator";
import { Volume2, Hash } from "lucide-react";

export const Route = createFileRoute("/servers/$serverId/channels/$channelId")({
  component: ChannelPage,
});

function ChannelPage() {
  const { serverId, channelId } = Route.useParams();

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

  const typingNames = typingUserIds
    .map(
      (id) =>
        members?.find((m) => m.user === id)?.expand?.user?.name || "Someone",
    )
    .filter(Boolean);

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

      <MessageList messages={messages} channelId={channelId} />

      <TypingIndicator typingNames={typingNames} />

      <MessageInput
        onSubmit={(content, file) =>
          sendMessage.mutate({ content, channelId, file })
        }
        onTyping={sendTyping}
        isSending={sendMessage.isPending}
      />
    </div>
  );
}
