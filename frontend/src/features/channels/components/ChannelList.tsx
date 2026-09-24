import { useCreateChannelModal } from "@/app/modals/useModalStore";
import { useCurrentMembership } from "@/features/members/hooks/useCurrentMembership";
import { Plus } from "lucide-react";
import { useChannels } from "../hooks/useChannels";
import { useReadStatesSubscription } from "../hooks/useReadStates";
import ChannelItem from "./ChannelItem";
import Tooltip from "@/components/ui/Tooltip";
import ChannelListSkeleton from "./ChannelListSkeleton";

export default function ChannelList({ serverId }: { serverId: string }) {
  const { data: channels, isLoading, isError, error } = useChannels(serverId);
  const { isOwner } = useCurrentMembership(serverId);
  const { openModal } = useCreateChannelModal();
  useReadStatesSubscription();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        <h2 className="text-sm">Channels</h2>

        {isOwner && (
          <Tooltip content="Create Channel">
            <button
              onClick={() => openModal(serverId)}
              className="text-sm transition-colors duration-100 hover:text-teal-500"
            >
              <Plus className="size-3 shrink-0" />
            </button>
          </Tooltip>
        )}
      </div>

      {isError ? (
        <p className="text-sm text-red-500">
          Failed to load channels: {error.message}
        </p>
      ) : isLoading ? (
        <ChannelListSkeleton />
      ) : (
        <ul className="flex flex-col gap-1">
          {channels?.map((c) => (
            <ChannelItem
              key={c.id}
              channel={c}
              serverId={serverId}
              isOwner={isOwner}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
