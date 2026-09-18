import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff } from "lucide-react";
import {
  useActiveChannelId,
  useIsDeafened,
  useIsMuted,
} from "../../stores/useVoiceChannelStore";
import Tooltip from "../ui/Tooltip";
import { useVoiceControls } from "../../hooks/useVoiceControls";

export function VoiceToolbar() {
  const activeChannelId = useActiveChannelId();
  const isMuted = useIsMuted();
  const isDeafened = useIsDeafened();
  const { toggleMute, toggleDeafen, disconnect } = useVoiceControls();

  if (!activeChannelId) return null;

  return (
    <div className="mt-auto flex items-center justify-between rounded bg-zinc-50 p-2 dark:bg-zinc-700/50">
      <Tooltip content={isMuted ? "Unmute" : "Mute"}>
        <button
          onClick={toggleMute}
          className="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      </Tooltip>

      <Tooltip content={isDeafened ? "Undeafen" : "Deafen"}>
        <button
          onClick={toggleDeafen}
          className="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          {isDeafened ? (
            <HeadphoneOff className="size-4" />
          ) : (
            <Headphones className="size-4" />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Disconnect">
        <button
          onClick={disconnect}
          className="rounded p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <PhoneOff className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
}
