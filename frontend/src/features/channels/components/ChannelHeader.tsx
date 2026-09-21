import { Volume2, Hash, PanelLeft, PanelRight } from "lucide-react";
import type { Channel } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import {
  useIsChannelsOpen,
  useIsMembersOpen,
  useUIActions,
} from "@/app/stores/useUIStore";

export default function ChannelHeader({
  channel,
}: {
  channel: Channel | undefined;
}) {
  const { toggleChannels, toggleMembers } = useUIActions();
  const isChannelsOpen = useIsChannelsOpen();
  const isMembersOpen = useIsMembersOpen();

  return (
    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-700">
      {!isChannelsOpen && (
        <Tooltip content="Show Channels">
          <button
            onClick={toggleChannels}
            className="text-sm hover:text-teal-500 dark:hover:text-teal-400"
          >
            <PanelLeft className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}

      <h2 className="flex items-center gap-2 text-xl font-bold">
        {channel?.type === "voice" ? (
          <Volume2 className="size-5 shrink-0" />
        ) : (
          <Hash className="size-5 shrink-0" />
        )}
        {channel?.name}
      </h2>

      {!isMembersOpen && (
        <Tooltip content="Show Members">
          <button
            onClick={toggleMembers}
            className="ml-auto text-sm hover:text-teal-500 dark:hover:text-teal-400"
          >
            <PanelRight className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
