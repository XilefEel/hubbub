import { useTypingIndicator } from "@/features/messages/hooks/useTypingIndicator";
import ConversationEmpty from "@/features/conversations/components/ConversationEmpty";
import { useConversationMembers } from "@/features/conversations/hooks/useConversationMembers";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";
import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";
import TypingIndicator from "@/features/messages/components/TypingIndicator";
import { useMessages } from "@/features/messages/hooks/useMessages";
import type { MessageScope, Message } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ConversationHeader from "@/features/conversations/components/ConversationHeader";
import { useIsInVoiceCall } from "@/features/voice/store/useVoiceChannelStore";
import VoiceRoomView from "@/features/voice/components/VoiceRoomView";
import { useConversations } from "@/features/conversations/hooks/useConversations";
import { useConversationReadMarker } from "@/features/messages/hooks/useReadMarker";

export const Route = createFileRoute("/me/conversations/$conversationId")({
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);

  const scope: MessageScope = {
    type: "conversation",
    id: conversationId,
  };

  const isInVoiceCall = useIsInVoiceCall(scope);

  const { data: messages, isLoading, isError, error } = useMessages(scope);

  const { data: members } = useConversationMembers(conversationId);
  const { typingNames, sendTyping } = useTypingIndicator(scope, members);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const readMarker = useConversationReadMarker(members);

  return (
    <div className="flex h-full flex-col text-zinc-900 dark:text-zinc-100">
      {isInVoiceCall && (
        <div className="h-1/2 min-h-0 shrink-0">
          <VoiceRoomView scope={scope} />
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col p-4">
        {!isInVoiceCall && conversation && (
          <ConversationHeader conversation={conversation} />
        )}

        {isError ? (
          <p className="text-red-500">
            Error loading messages: {error.message}
          </p>
        ) : isLoading ? (
          <MessagesSkeleton />
        ) : (
          <MessageList
            messages={messages}
            scope={scope}
            readMarker={readMarker}
            onReply={setReplyingTo}
            emptyState={
              conversation && <ConversationEmpty conversation={conversation} />
            }
          />
        )}

        <TypingIndicator typingNames={typingNames} />

        <MessageInput
          members={members}
          replyingTo={replyingTo}
          scope={scope}
          onTyping={sendTyping}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
}
