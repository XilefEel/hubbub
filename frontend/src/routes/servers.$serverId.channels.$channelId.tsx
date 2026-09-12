import { createFileRoute } from "@tanstack/react-router";
import { useMessages, useSendMessage } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useServerMembers } from "../hooks/useServerMembers";
import { TypingIndicator } from "../components/messages/TypingIndicator";
import { Volume2, Hash } from "lucide-react";
import { useChannelDetail } from "../hooks/useChannels";
import { MessageInput } from "../components/messages/MessageInput";
import { MessageList } from "../components/messages/MessageList";
import { useState } from "react";
import type { Message } from "../lib/types";
import { useReactions, useToggleReaction } from "../hooks/useReactions";

export const Route = createFileRoute("/servers/$serverId/channels/$channelId")({
  component: ChannelPage,
});

function ChannelPage() {
  const { serverId, channelId } = Route.useParams();

  const {
    data: channel,
    isLoading: channelLoading,
    isError: channelIsError,
    error: channelError,
  } = useChannelDetail(channelId);

  const { data: members } = useServerMembers(serverId);

  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesIsError,
    error: messagesError,
  } = useMessages(channelId);

  const { data: reactions } = useReactions(channelId);

  const { toggle } = useToggleReaction();

  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (!reactions) return;
    toggle(reactions, messageId, emoji);
  };

  const { typingUserIds, sendTyping } = useTypingIndicator(channelId);
  const sendMessage = useSendMessage();

  const typingNames = typingUserIds
    .map(
      (id) =>
        members?.find((m) => m.user === id)?.expand?.user?.name || "Someone",
    )
    .filter(Boolean);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  if (channelLoading) return <p className="p-8">Loading channel...</p>;

  if (channelIsError)
    return (
      <p className="p-8 text-red-500">
        Channel not found or access denied: {channelError.message}
      </p>
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

      {messagesIsError && (
        <p className="text-red-500">
          Error loading messages: {messagesError.message}
        </p>
      )}

      <MessageList
        messages={messages}
        channelId={channelId}
        onReply={setReplyingTo}
        onToggleReaction={handleToggleReaction}
        reactions={reactions}
      />

      <TypingIndicator typingNames={typingNames} />

      <MessageInput
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSubmit={(content, files) => {
          sendMessage.mutate(
            { content, channelId, files, replyTo: replyingTo?.id },
            { onSuccess: () => setReplyingTo(null) },
          );
        }}
        onTyping={sendTyping}
        isSending={sendMessage.isPending}
      />
    </div>
  );
}
