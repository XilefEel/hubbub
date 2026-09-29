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

  const scope: MessageScope = {
    type: "conversation",
    id: conversationId,
  };

  const { data: messages } = useMessages(scope);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} scope={scope} onReply={setReplyingTo} />

      <div className="p-4">
        <MessageInput
          members={undefined}
          replyingTo={replyingTo}
          scope={scope}
          onTyping={() => {}}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
}
