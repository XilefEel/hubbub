import { useConversations } from "../hooks/useConversations";
import ConversationListItem from "./ConversationListItem";

export default function ConversationList() {
  const { data: conversations } = useConversations();

  return (
    <div className="flex flex-col gap-1">
      <h2 className="px-2 text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        Direct Messages
      </h2>

      {conversations?.map((c) => (
        <ConversationListItem key={c.id} conversationId={c.id} />
      ))}
    </div>
  );
}
