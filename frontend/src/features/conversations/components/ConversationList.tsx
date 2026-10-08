import { Plus } from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import ConversationItem from "./ConversationItem";
import ConversationListSkeleton from "./ConversationListSkeleton";
import Tooltip from "@/components/ui/Tooltip";
import { useCreateGroupModal } from "../modals/useCreateGroupModal";

export default function ConversationList() {
  const { data: conversations, isError, isLoading, error } = useConversations();
  const { openModal } = useCreateGroupModal();

  return (
    <div className="flex flex-col gap-1">
      <h2 className="flex flex-row px-2 text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        <span>Direct Messages</span>

        <Tooltip content="Create Group">
          <button className="ml-auto" onClick={() => openModal(null)}>
            <Plus className="size-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" />
          </button>
        </Tooltip>
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
