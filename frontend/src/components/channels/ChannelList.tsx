import { Link } from "@tanstack/react-router";
import { useChannels } from "../../hooks/useChannels";
import { Volume2, Hash } from "lucide-react";

export function ChannelList({ serverId }: { serverId: string }) {
  const { data: channel, isLoading, error } = useChannels(serverId);

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading channels...</p>;

  if (error)
    return <p className="text-sm text-red-500">Failed to load channels</p>;

  return (
    <ul className="flex flex-col gap-1">
      {channel?.map((c) => (
        <li key={c.id} className="flex items-center justify-between text-sm">
          <Link
            to="/servers/$serverId/channels/$channelId"
            params={{ serverId, channelId: c.id }}
            className="flex w-full items-center gap-1 rounded px-2 py-1 hover:bg-zinc-50"
            activeProps={{ className: "bg-zinc-100 font-medium" }}
          >
            {c.type === "voice" ? (
              <Volume2 className="size-4 shrink-0" />
            ) : (
              <Hash className="size-4 shrink-0" />
            )}
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
