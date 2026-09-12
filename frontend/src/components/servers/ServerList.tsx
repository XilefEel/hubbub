import { Link } from "@tanstack/react-router";
import { useServers } from "../../hooks/useServers";

export function ServerList() {
  const { data: servers, isLoading, isError, error } = useServers();

  if (isLoading) return <p>Loading servers...</p>;

  if (isError)
    return (
      <p className="text-red-500">Failed to load servers: {error.message}</p>
    );

  return (
    <ul className="flex flex-col gap-2">
      {servers && servers.length > 0 ? (
        <>
          <li>Your Servers:</li>
          {servers.map((server) => (
            <Link
              key={server.id}
              to="/servers/$serverId"
              params={{ serverId: server.id }}
              className="block rounded border px-3 py-2 hover:bg-zinc-50"
            >
              {server.name}
            </Link>
          ))}
        </>
      ) : (
        <li>You haven't joined any servers</li>
      )}
    </ul>
  );
}
