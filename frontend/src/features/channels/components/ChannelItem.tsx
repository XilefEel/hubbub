import { Volume2, Hash } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  useJoinVoiceChannel,
  useServerVoiceParticipants,
} from "@/features/voice/hooks/useVoiceChannel";
import { useChannelReads } from "../hooks/useReadStates";
import ChannelContextMenu from "./ChannelContextMenu";
import type { Channel, VoiceScope } from "@/lib/types";
import VoiceParticipantsList from "@/features/voice/components/VoiceParticipantsList";
import { useActiveScope } from "@/features/voice/store/useVoiceChannelStore";
import { isAfter } from "@/lib/utils";

export default function ChannelItem({
  channel,
  serverId,
  isOwner,
}: {
  channel: Channel;
  serverId: string;
  isOwner: boolean;
}) {
  const activeScope = useActiveScope();
  const joinVoice = useJoinVoiceChannel();

  const scope: VoiceScope = {
    type: "channel",
    id: channel.id,
  };

  const isThisChannelActive = activeScope?.id === channel.id;

  const { data: reads, isPending } = useChannelReads();
  const read = reads?.get(channel.id);

  const mentionCount = read?.mentionCount ?? 0;

  const isUnread =
    !isPending &&
    channel.type !== "voice" &&
    !!channel.lastMessageAt &&
    (!read || isAfter(channel.lastMessageAt, read.lastReadAt));

  const handleClick = () => {
    if (channel.type !== "voice") return;
    if (isThisChannelActive) return;
    joinVoice.mutate(scope);
  };

  const { data: voiceByChannel } = useServerVoiceParticipants(serverId);

  return (
    <div>
      <ChannelContextMenu
        channel={channel}
        serverId={serverId}
        isOwner={isOwner}
      >
        <li className="flex items-center justify-between text-sm">
          <Link
            to="/servers/$serverId/channels/$channelId"
            params={{ serverId, channelId: channel.id }}
            onClick={handleClick}
            className="flex w-full items-center gap-1 rounded px-2 py-1 transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
            activeProps={{
              className:
                "bg-zinc-100 hover:bg-zinc-100 font-semibold dark:bg-zinc-700 dark:hover:bg-zinc-700",
            }}
          >
            {channel.type === "voice" ? (
              <Volume2 className="size-4 shrink-0" />
            ) : (
              <Hash className="size-4 shrink-0" />
            )}

            <span className="truncate">{channel.name}</span>

            {mentionCount > 0 ? (
              <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {mentionCount}
              </span>
            ) : (
              isUnread && (
                <span className="ml-auto size-1.5 rounded-full bg-teal-500" />
              )
            )}
          </Link>
        </li>
      </ChannelContextMenu>

      {channel.type === "voice" && (
        <VoiceParticipantsList
          participants={voiceByChannel?.get(channel.id) ?? []}
        />
      )}
    </div>
  );
}
