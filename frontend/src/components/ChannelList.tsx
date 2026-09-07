import { Link } from "@tanstack/react-router";
import { useChannels } from "../hooks/useChannels";

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
            className="block w-full rounded px-2 py-1 hover:bg-zinc-50"
            activeProps={{ className: "bg-zinc-100 font-medium" }}
          >
            {c.type === "text" ? "# " : "🔊 "}
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
