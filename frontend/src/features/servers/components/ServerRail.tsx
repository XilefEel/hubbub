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
import ServerContextMenu from "./ServerContextMenu";
import ServerSkeleton from "./ServerSkeleton";

export default function ServerRail() {
  const { serverId } = useParams({ strict: false });
  const { data: servers, isLoading, isError, error } = useServers();
  const { openModal: openCreate } = useCreateServerModal();
  const { openModal: openJoin } = useJoinServerModal();
  const { openModal: openSettings } = useSettingsModal();

  return (
    <nav
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto py-3",
        "border-r border-zinc-200 dark:border-transparent",
        "bg-white dark:bg-zinc-900",
      )}
    >
      <div className="group relative flex w-full justify-center">
        <span
          className={cn(
            "absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-zinc-800 dark:bg-white",
            "transition-[height] duration-100",
            serverId === undefined ? "h-10" : "h-0 group-hover:h-5",
          )}
        />
        <Tooltip content="Home" side="right">
          <Link
            to="/me"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center",
              "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
              serverId === undefined
                ? "rounded-xl bg-teal-500 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
            )}
          >
            <Home className="size-5 shrink-0" />
          </Link>
        </Tooltip>
      </div>

      <div className="w-12 border-t border-zinc-200 dark:border-zinc-700" />

      {isError ? (
        <p className="h-full w-16 bg-white text-red-500 dark:bg-zinc-800">
          Failed to load servers: {error.message}
        </p>
      ) : isLoading ? (
        <ServerSkeleton />
      ) : (
        <div className="flex w-full flex-col items-center gap-2 overflow-y-auto">
          {servers?.map((server) => (
            <ServerContextMenu key={server.id} server={server}>
              <div className="group relative flex w-full justify-center">
                <span
                  className={cn(
                    "absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-zinc-800 dark:bg-white",
                    "transition-[height] duration-100",
                    serverId === server.id ? "h-10" : "h-0 group-hover:h-5",
                  )}
                />
                <Tooltip content={server.name} side="right">
                  <Link
                    to="/servers/$serverId"
                    params={{ serverId: server.id }}
                    aria-label={server.name}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center overflow-hidden",
                      "transition-[border-radius,background-color] duration-100",
                      serverId === server.id
                        ? "rounded-xl bg-teal-500 text-white"
                        : "rounded-[50%] bg-zinc-100 hover:rounded-xl hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
                    )}
                  >
                    {server.icon ? (
                      <img
                        src={pb.files.getURL(server, server.icon, {
                          thumb: "100x100",
                        })}
                        alt="server icon"
                        className="size-full object-cover"
                      />
                    ) : (
                      server.name.slice(0, 2).toUpperCase()
                    )}
                  </Link>
                </Tooltip>
              </div>
            </ServerContextMenu>
          ))}
        </div>
      )}

      <div className="mt-auto w-12 border-t border-zinc-200 dark:border-zinc-700" />

      <Tooltip content="Create server" side="right">
        <button
          onClick={openCreate}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center",
            "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
          )}
        >
          <Plus className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Join server" side="right">
        <button
          onClick={openJoin}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center",
            "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
          )}
        >
          <Compass className="size-5 shrink-0" />
        </button>
      </Tooltip>

      <Tooltip content="Settings" side="right">
        <button
          onClick={openSettings}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center",
            "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
            "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
          )}
        >
          <Settings className="size-5 shrink-0" />
        </button>
      </Tooltip>
    </nav>
  );
}
