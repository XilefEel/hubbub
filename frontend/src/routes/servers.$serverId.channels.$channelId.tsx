import ChannelHeader from "@/features/channels/components/ChannelHeader";
import ChannelPageSkeleton from "@/features/channels/components/ChannelPageSkeleton";
import { useChannelDetail } from "@/features/channels/hooks/useChannels";
import { useTypingIndicator } from "@/features/channels/hooks/useTypingIndicator";
import { useServerMembers } from "@/features/members/hooks/useServerMembers";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";
import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";
import TypingIndicator from "@/features/messages/components/TypingIndicator";
import { useMessages } from "@/features/messages/hooks/useMessages";
import VoiceChannel from "@/features/voice/components/VoiceChannel";
import type { Message } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

  if (channelLoading) return <ChannelPageSkeleton />;

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

        {messagesIsError ? (
          <p className="text-red-500">
            Error loading messages: {messagesError.message}
          </p>
        ) : messagesLoading ? (
          <MessagesSkeleton />
        ) : (
          <MessageList
            messages={messages}
            channel={channel}
            onReply={setReplyingTo}
          />
        )}

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
