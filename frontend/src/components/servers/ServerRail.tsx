import { Link, useParams } from "@tanstack/react-router";
import { useServers } from "../../hooks/useServers";
import { Compass, Home, Plus, Settings } from "lucide-react";
import { cn } from "cn";
import { ServerContextMenu } from "../context-menus/ServerContextMenu";
import { Tooltip } from "../ui/Tooltip";
import {
  useCreateServerModal,
  useJoinServerModal,
  useSettingsModal,
} from "../../stores/useModalStore";

export function ServerRail() {
  const { serverId } = useParams({ strict: false });
  const { data: servers, isLoading, isError, error } = useServers();
  const { openModal: openCreate } = useCreateServerModal();
  const { openModal: openJoin } = useJoinServerModal();
  const { openModal: openSettings } = useSettingsModal();

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
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          serverId === undefined
            ? "bg-teal-500 text-white"
            : "bg-zinc-100 hover:bg-zinc-200",
        )}
      >
        <Home className="size-5 shrink-0" />
      </Link>

      <div className="w-12 border-t border-zinc-200" />

      <div className="flex flex-col items-center gap-2 overflow-y-auto">
        {servers?.map((server) => (
          <ServerContextMenu
            key={server.id}
            serverId={server.id}
            inviteCode={server.inviteCode}
          >
            <Link
              to="/servers/$serverId"
              params={{ serverId: server.id }}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                serverId === server.id
                  ? "bg-teal-500 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200",
              )}
            >
              {server.name.slice(0, 2).toUpperCase()}
            </Link>
          </ServerContextMenu>
        ))}
      </div>

      <div className="mt-auto w-12 border-t border-zinc-200" />

      <Tooltip content="Create server" side="right">
        <button
          onClick={openCreate}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200"
        >
          <Plus className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Join server" side="right">
        <button
          onClick={openJoin}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200"
        >
          <Compass className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Settings" side="right">
        <button
          onClick={openSettings}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200"
        >
          <Settings className="size-5 shrink-0" />
        </button>
      </Tooltip>
    </nav>
  );
}
