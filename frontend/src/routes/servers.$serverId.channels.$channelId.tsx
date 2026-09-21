import { createFileRoute } from "@tanstack/react-router";
import { useMessages } from "../features/messages/hooks/useMessages";
import { useTypingIndicator } from "../features/channels/hooks/useTypingIndicator";
import { useServerMembers } from "../features/members/hooks/useServerMembers";
import { TypingIndicator } from "../features/messages/components/TypingIndicator";
import { useChannelDetail } from "../features/channels/hooks/useChannels";
import { MessageInput } from "../features/messages/components/MessageInput";
import { MessageList } from "../features/messages/components/MessageList";
import { useState } from "react";
import type { Message } from "../lib/types";
import ChannelHeader from "../features/channels/components/ChannelHeader";
import { VoiceChannel } from "../features/voice/components/VoiceChannel";

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

  const { typingNames, sendTyping } = useTypingIndicator(channelId, members);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  if (channelLoading)
    return <div className="h-full bg-white dark:bg-zinc-800">Loading...</div>;

  if (channelIsError)
    return (
      <p className="h-full bg-white p-8 text-red-500 dark:bg-zinc-800 dark:text-zinc-100">
        Channel not found or access denied: {channelError.message}
      </p>
    );

  if (!channel) return null;

  if (channel.type === "text")
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col p-4 text-zinc-900 dark:text-zinc-100">
        <ChannelHeader channel={channel} />

        {messagesLoading && <p>Loading messages...</p>}

        {messagesIsError && (
          <p className="text-red-500">
            Error loading messages: {messagesError.message}
          </p>
        )}

        <MessageList
          messages={messages}
          channel={channel!}
          onReply={setReplyingTo}
        />

        <TypingIndicator typingNames={typingNames} />

        <MessageInput
          members={members}
          replyingTo={replyingTo}
          channelId={channelId}
          onTyping={sendTyping}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    );

  return <VoiceChannel channel={channel} />;
}
