import { useConversations } from "../hooks/useConversations";
import ConversationItem from "./ConversationItem";
import ConversationListSkeleton from "./ConversationListSkeleton";

export default function ConversationList() {
  const { data: conversations, isError, isLoading, error } = useConversations();

  return (
    <div className="flex flex-col gap-1">
      <h2 className="px-2 text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        Direct Messages
      </h2>

      {isError ? (
        <p className="text-sm text-red-500">
          Failed to load conversations: {error.message}
        </p>
      ) : isLoading ? (
        <ConversationListSkeleton />
      ) : (
        conversations?.map((c) => (
          <ConversationItem key={c.id} conversation={c} />
        ))
      )}
    </div>
  );
}
