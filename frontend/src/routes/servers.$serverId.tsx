import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";
import { MemberList } from "../components/MemberList";
import { ChannelList } from "../components/ChannelList";
import { CreateChannelForm } from "../components/CreateChannelForm";
import { queryKeys } from "../lib/querykeys";

export const Route = createFileRoute("/servers/$serverId")({
  component: ServerPage,
});

function ServerPage() {
  const { serverId } = Route.useParams();

  const {
    data: server,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.servers.list(serverId),
    queryFn: () => pb.collection("servers").getOne(serverId),
  });

  if (isLoading) return <p>Loading server...</p>;

  if (error) return <p className="text-red-500">Failed to load server</p>;

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col gap-4 border-r p-4">
        <h1 className="text-xl font-bold">{server?.name}</h1>

        <p className="text-sm text-zinc-500">
          Invite code: {server?.inviteCode}
        </p>

        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-sm text-zinc-500">Channels</h2>
          <ChannelList serverId={serverId} />
          <CreateChannelForm serverId={serverId} />
        </div>
      </aside>

      {/* messages */}
      <main className="flex-1">
        <Outlet />
      </main>

      <aside className="flex w-64 flex-col gap-2 border-l p-4">
        <h2 className="mb-2 text-sm text-zinc-500">Members</h2>
        <MemberList serverId={serverId} />
      </aside>
    </div>
  );
}
