import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";

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
    queryKey: ["servers", serverId],
    queryFn: () => pb.collection("servers").getOne(serverId),
  });

  if (isLoading) return <p>Loading server...</p>;
  if (error) return <p className="text-red-500">Failed to load server</p>;

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">{server?.name}</h1>
      <p className="text-sm text-gray-500">Invite code: {server?.inviteCode}</p>
    </div>
  );
}
