import { Link, useParams } from "@tanstack/react-router";
import { useServers } from "../../hooks/useServers";
import { Home } from "lucide-react";
import { cn } from "cn";

export function ServerRail() {
  const { serverId } = useParams({ strict: false });
  const { data: servers, isLoading, isError, error } = useServers();

  if (isLoading) return <p>Loading servers...</p>;

  if (isError)
    return (
      <p className="text-red-500">Failed to load servers: {error.message}</p>
    );

  return (
    <nav className="flex h-full w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-zinc-200 py-3">
      <Link
        to="/"
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          serverId === undefined
            ? "bg-teal-500 text-white"
            : "bg-gray-100 hover:bg-teal-100",
        )}
      >
        <Home className="size-5 shrink-0" />
      </Link>

      <div className="w-12 border-t border-zinc-200" />

      {servers?.map((server) => (
        <Link
          key={server.id}
          to="/servers/$serverId"
          params={{ serverId: server.id }}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            serverId === server.id
              ? "bg-teal-500 text-white"
              : "bg-gray-100 hover:bg-teal-100",
          )}
        >
          {server.name.slice(0, 2).toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
