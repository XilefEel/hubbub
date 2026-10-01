import { pb } from "@/lib/pocketbase";
import { findPartner } from "../hooks/useConversationMembers";
import { useConversations } from "../hooks/useConversations";
import ConversationItem from "./ConversationItem";

export default function ConversationList() {
  const userId = pb.authStore.record?.id;
  const { data: conversations } = useConversations();

  return (
    <div className="flex flex-col gap-1">
      <h2 className="px-2 text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        Direct Messages
      </h2>

      {conversations?.map((c) => (
        <ConversationItem
          key={c.id}
          conversationId={c.id}
          partner={findPartner(
            c.expand?.conversation_members_via_conversation,
            userId,
          )}
        />
      ))}
    </div>
  );
}
