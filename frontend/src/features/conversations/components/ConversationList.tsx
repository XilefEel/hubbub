import { Plus } from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import ConversationItem from "./ConversationItem";
import ConversationListSkeleton from "./ConversationListSkeleton";
import Tooltip from "@/components/ui/Tooltip";
import { useGroupModal } from "../modals/useGroupModal";
import { isConversationHidden } from "../hooks/useConversationMembers";
import { pb } from "@/lib/pocketbase";
import { useDmActiveCalls } from "@/features/voice/hooks/useVoiceParticipants";

export default function ConversationList() {
  const userId = pb.authStore.record?.id;
  const { data: conversations, isError, isLoading, error } = useConversations();
  const { data: voiceByDms } = useDmActiveCalls();

  const visible = conversations?.filter(
    (c) => !isConversationHidden(c, userId),
  );
  const { openModal } = useGroupModal();

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
        visible?.map((c) => (
          <ConversationItem
            key={c.id}
            conversation={c}
            participants={voiceByDms?.get(c.id) ?? []}
          />
        ))
      )}
    </div>
  );
}
