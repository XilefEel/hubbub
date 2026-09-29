import { useTypingIndicator } from "@/features/channels/hooks/useTypingIndicator";
import ConversationEmpty from "@/features/conversations/components/ConversationEmpty";
import {
  useConversationMembers,
  useConversationPartner,
} from "@/features/conversations/hooks/useConversationMembers";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";
import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";
import TypingIndicator from "@/features/messages/components/TypingIndicator";
import { useMessages } from "@/features/messages/hooks/useMessages";
import type { MessageScope, Message } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/me/conversations/$conversationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { data: members } = useConversationMembers(conversationId);
  const { partner } = useConversationPartner(conversationId);

  const scope: MessageScope = {
    type: "conversation",
    id: conversationId,
  };

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
        members={undefined}
        replyingTo={replyingTo}
        scope={scope}
        onTyping={sendTyping}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
