import { createFileRoute } from "@tanstack/react-router";
import { useMessages } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useServerMembers } from "../hooks/useServerMembers";
import { TypingIndicator } from "../components/messages/TypingIndicator";
import { useChannelDetail } from "../hooks/useChannels";
import { MessageInput } from "../components/messages/MessageInput";
import { MessageList } from "../components/messages/MessageList";
import { useState } from "react";
import type { Message } from "../lib/types";
import ChannelHeader from "../components/channels/ChannelHeader";

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
      <p className="h-full bg-white p-8 text-red-500 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        Channel not found or access denied: {channelError.message}
      </p>
    );

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
        replyingTo={replyingTo}
        channelId={channelId}
        onTyping={sendTyping}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
