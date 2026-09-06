import { useChannels } from "../hooks/useChannels";

export function ChannelList({ serverId }: { serverId: string }) {
  const { data: channel, isLoading, error } = useChannels(serverId);

  console.log("ChannelList data:", channel);

  if (isLoading)
    return <p className="text-sm text-gray-500">Loading channels...</p>;

  if (error)
    return <p className="text-sm text-red-500">Failed to load channels</p>;

  return (
    <ul className="flex flex-col gap-1">
      {channel?.map((c) => (
        <li key={c.id} className="flex items-center justify-between">
          <span>
            {c.type === "text" ? "# " : "voice "}
            {c.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
