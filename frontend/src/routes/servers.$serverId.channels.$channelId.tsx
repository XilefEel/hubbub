import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Channel } from "../lib/types";

export const Route = createFileRoute("/servers/$serverId/channels/$channelId")({
  component: ChannelPage,
});

function ChannelPage() {
  const { channelId } = Route.useParams();

  const {
    data: channel,
    isLoading,
    error,
  } = useQuery<Channel>({
    queryKey: ["channels", "detail", channelId],
    queryFn: () => pb.collection("channels").getOne<Channel>(channelId),
  });

  if (isLoading) return <p className="p-8">Loading channel...</p>;

  if (error)
    return (
      <p className="p-8 text-red-500">Channel not found or access denied</p>
    );

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold">
        {channel?.type === "text" ? "# " : "🔊 "}
        {channel?.name}
      </h2>
      <p className="text-sm text-zinc-400">Messages</p>
    </div>
  );
}
