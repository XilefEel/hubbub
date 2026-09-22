import { Link, useParams } from "@tanstack/react-router";
import { useServers } from "../hooks/useServers";
import { Compass, Home, Plus, Settings } from "lucide-react";
import { cn } from "cn";
import Tooltip from "@/components/ui/Tooltip";
import {
  useCreateServerModal,
  useJoinServerModal,
  useSettingsModal,
} from "@/app/modals/useModalStore";
import { pb } from "@/lib/pocketbase";
import { ServerContextMenu } from "./ServerContextMenu";

export function ServerRail() {
  const { serverId } = useParams({ strict: false });
  const { data: servers, isLoading, isError, error } = useServers();
  const { openModal: openCreate } = useCreateServerModal();
  const { openModal: openJoin } = useJoinServerModal();
  const { openModal: openSettings } = useSettingsModal();

  if (isLoading)
    return (
      <div className="h-full w-16 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        Loading...
      </div>
    );

  if (isError)
    return (
      <p className="h-full w-16 bg-white text-red-500 dark:bg-zinc-800">
        Failed to load servers: {error.message}
      </p>
    );

  return (
    <nav
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto py-3",
        "border-r border-zinc-200 dark:border-zinc-700",
        "bg-white dark:bg-zinc-800",
      )}
    >
      <Tooltip content="Home" side="right">
        <Link
          to="/"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-100",
            serverId === undefined
              ? "bg-teal-500 text-white"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600",
          )}
        >
          <Home className="size-5 shrink-0" />
        </Link>
      </Tooltip>

      <div className="w-12 border-t border-zinc-200 dark:border-zinc-700" />

      <div className="flex flex-col items-center gap-2 overflow-y-auto">
        {servers?.map((server) => (
          <ServerContextMenu key={server.id} server={server}>
            <div>
              <Tooltip content={server.name} side="right">
                <Link to="/servers/$serverId" params={{ serverId: server.id }}>
                  {server.icon ? (
                    <img
                      src={pb.files.getURL(server, server.icon, {
                        thumb: "100x100",
                      })}
                      alt={server.name}
                      className="size-10 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        serverId === server.id
                          ? "bg-teal-500 text-white"
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600",
                      )}
                    >
                      {server.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </div>
          </ServerContextMenu>
        ))}
      </div>

      <div className="mt-auto w-12 border-t border-zinc-200 dark:border-zinc-700" />

      <Tooltip content="Create server" side="right">
        <button
          onClick={openCreate}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600",
          )}
        >
          <Plus className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Join server" side="right">
        <button
          onClick={openJoin}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600",
          )}
        >
          <Compass className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Settings" side="right">
        <button
          onClick={openSettings}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600",
          )}
        >
          <Settings className="size-5 shrink-0" />
        </button>
      </Tooltip>
    </nav>
  );
}
