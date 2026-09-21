import { useCreateChannelModal } from "@/app/modals/useModalStore";
import { useCurrentMembership } from "@/features/members/hooks/useCurrentMembership";
import { Plus } from "lucide-react";
import { useChannels } from "../hooks/useChannels";
import { useReadStatesSubscription } from "../hooks/useReadStates";
import ChannelItem from "./ChannelItem";
import Tooltip from "@/components/ui/Tooltip";

export function ChannelList({ serverId }: { serverId: string }) {
  const { data: channel, isLoading, isError, error } = useChannels(serverId);
  const { isOwner } = useCurrentMembership(serverId);
  const { openModal } = useCreateChannelModal();
  useReadStatesSubscription();

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading channels...</p>;

  if (isError)
    return (
      <p className="text-sm text-red-500">
        Failed to load channels: {error.message}
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        <h2 className="text-sm">Channels</h2>

        {isOwner && (
          <Tooltip content="Create Channel">
            <button
              onClick={() => openModal(serverId)}
              className="text-sm hover:text-teal-500"
            >
              <Plus className="size-3 shrink-0" />
            </button>
          </Tooltip>
        )}
      </div>

      <ul className="flex flex-col gap-1">
        {channel?.map((c) => (
          <ChannelItem
            key={c.id}
            channel={c}
            serverId={serverId}
            isOwner={isOwner}
          />
        ))}
      </ul>
    </div>
  );
}
