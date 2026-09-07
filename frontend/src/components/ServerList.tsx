import { Link } from "@tanstack/react-router";
import { useServers } from "../hooks/useServers";

export function ServerList() {
  const { data: servers, isLoading, error } = useServers();

  if (isLoading) return <p>Loading servers...</p>;
  if (error) return <p className="text-red-500">Failed to load servers</p>;

  return (
    <ul className="flex flex-col gap-2">
      {servers && servers.length > 0 ? (
        <>
          <li>Your Servers:</li>
          {servers.map((server) => (
            <Link
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
