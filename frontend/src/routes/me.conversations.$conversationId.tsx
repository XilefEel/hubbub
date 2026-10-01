import { useTypingIndicator } from "@/features/messages/hooks/useTypingIndicator";
import ConversationEmpty from "@/features/conversations/components/ConversationEmpty";
import {
  findPartner,
  useConversationMembers,
} from "@/features/conversations/hooks/useConversationMembers";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";
import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";
import TypingIndicator from "@/features/messages/components/TypingIndicator";
import { useMessages } from "@/features/messages/hooks/useMessages";
import type { MessageScope, Message } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import ConversationHeader from "@/features/conversations/components/ConversationHeader";
import { useIsInVoiceCall } from "@/features/voice/store/useVoiceChannelStore";
import VoiceRoomView from "@/features/voice/components/VoiceRoomView";

export const Route = createFileRoute("/me/conversations/$conversationId")({
  component: ConversationPage,
});

function ConversationPage() {
  const userId = pb.authStore.record?.id;
  const { conversationId } = Route.useParams();
  const { data: members } = useConversationMembers(conversationId);
  const partner = findPartner(members, userId);

  const scope: MessageScope = {
    type: "conversation",
    id: conversationId,
  };

  const isInVoiceCall = useIsInVoiceCall(scope);

  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesIsError,
    error: messagesError,
  } = useMessages(scope);

  const { typingNames, sendTyping } = useTypingIndicator(scope, members);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 text-zinc-900 dark:text-zinc-100">
      <ConversationHeader partner={partner} conversationId={conversationId} />

      {isInVoiceCall && (
        <div className="h-1/2 min-h-0 border-b border-zinc-200 dark:border-zinc-700">
          <VoiceRoomView scope={scope} />
        </div>
      )}

      {messagesIsError ? (
        <p className="text-red-500">
          Error loading messages: {messagesError.message}
        </p>
      ) : messagesLoading ? (
        <MessagesSkeleton />
      ) : (
        <MessageList
          messages={messages}
          scope={scope}
          onReply={setReplyingTo}
          emptyState={<ConversationEmpty user={partner} />}
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
  );
}
