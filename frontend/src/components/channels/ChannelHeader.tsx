import { Volume2, Hash, PanelLeft, PanelRight } from "lucide-react";
import type { Channel } from "../../lib/types";
import { Tooltip } from "../ui/Tooltip";
import {
  useIsLeftbarOpen,
  useIsRightbarOpen,
  useUIActions,
} from "../../stores/useUIStore";

export default function ChannelHeader({
  channel,
}: {
  channel: Channel | undefined;
}) {
  const { toggleLeftbar, toggleRightbar } = useUIActions();
  const isLeftbarOpen = useIsLeftbarOpen();
  const isRightbarOpen = useIsRightbarOpen();

  return (
    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
      {!isLeftbarOpen && (
        <Tooltip content="Toggle Leftbar">
          <button
            onClick={toggleLeftbar}
            className="text-sm hover:text-teal-500"
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

      {!isRightbarOpen && (
        <Tooltip content="Toggle Rightbar">
          <button
            onClick={toggleRightbar}
            className="ml-auto text-sm hover:text-teal-500"
          >
            <PanelRight className="size-4 shrink-0" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
