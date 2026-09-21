import { Volume2, Hash } from "lucide-react";
import type { Channel } from "../../lib/types";
import { ChannelContextMenu } from "../context-menus/ChannelContextMenu";
import { Link } from "@tanstack/react-router";
import {
  useVoiceParticipants,
  useJoinVoiceChannel,
} from "../../hooks/useVoiceChannel";
import { useActiveChannelId } from "../../stores/useVoiceChannelStore";
import UserAvatar from "../ui/UserAvatar";
import { useChannelReads } from "../../hooks/useReadStates";

export default function ChannelItem({
  channel,
  serverId,
  isOwner,
}: {
  channel: Channel;
  serverId: string;
  isOwner: boolean;
}) {
  const { data: participants } = useVoiceParticipants(channel.id);
  const activeChannelId = useActiveChannelId();
  const joinVoice = useJoinVoiceChannel();

  const isThisChannelActive = activeChannelId === channel.id;

  const { data: reads } = useChannelReads();
  const read = reads?.find((r) => r.channel === channel.id);

  const mentionCount = read?.mention_count ?? 0;

  const isUnread =
    channel.type !== "voice" &&
    !!channel.last_message_at &&
    (!read || channel.last_message_at > read.last_read_at);

  const handleClick = () => {
    if (channel.type !== "voice") return;
    if (isThisChannelActive) return;
    joinVoice.mutate(channel.id);
  };

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
            className="flex w-full items-center gap-1 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
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

      {channel.type === "voice" && participants && participants.length > 0 && (
        <ul className="mt-1 ml-8 flex flex-col gap-1">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <UserAvatar user={p.expand?.user} size="size-5" />
              {p.expand?.user?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
