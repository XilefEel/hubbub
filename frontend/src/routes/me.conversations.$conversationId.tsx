import ConversationEmpty from "@/features/conversations/components/ConversationEmpty";
import { useConversationPartner } from "@/features/conversations/hooks/useConversationMembers";
import MessageInput from "@/features/messages/components/MessageInput";
import MessageList from "@/features/messages/components/MessageList";
import { useMessages } from "@/features/messages/hooks/useMessages";
import type { MessageScope, Message } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/me/conversations/$conversationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { partner } = useConversationPartner(conversationId);

  const scope: MessageScope = {
    type: "conversation",
    id: conversationId,
  };

  const { data: messages } = useMessages(scope);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 text-zinc-900 dark:text-zinc-100">
      <MessageList
        messages={messages}
        scope={scope}
        onReply={setReplyingTo}
        emptyState={<ConversationEmpty user={partner} />}
      />

      <MessageInput
        members={undefined}
        replyingTo={replyingTo}
        scope={scope}
        onTyping={() => {}}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
