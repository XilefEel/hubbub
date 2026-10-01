import type { Channel, VoiceScope } from "@/lib/types";
import { useJoinVoiceChannel } from "../hooks/useVoiceChannel";
import VoiceRoomView from "./VoiceRoomView";
import { useIsInVoiceCall } from "../store/useVoiceChannelStore";

export default function VoiceChannel({ channel }: { channel: Channel }) {
  const scope: VoiceScope = {
    type: "channel",
    id: channel.id,
  };

  const isInVoiceCall = useIsInVoiceCall(scope);
  const joinVoice = useJoinVoiceChannel();

  if (!isInVoiceCall)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-900 dark:text-zinc-100">
        <h2 className="text-2xl font-semibold">{channel.name}</h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          No one is currently in this channel.
        </p>

        <button
          onClick={() => joinVoice.mutate(scope)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Join Voice
        </button>
      </div>
    );

  return <VoiceRoomView scope={scope} />;
}
