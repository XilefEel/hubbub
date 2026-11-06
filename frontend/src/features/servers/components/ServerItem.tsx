import Tooltip from "@/components/ui/Tooltip";
import { pb } from "@/lib/pocketbase";
import type { Server } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import ServerContextMenu from "./ServerContextMenu";

export default function ServerItem({
  server,
  selectedServerId,
}: {
  server: Server;
  selectedServerId: string;
}) {
  return (
    <ServerContextMenu server={server}>
      <div className="group relative flex w-full justify-center">
        <span
          className={cn(
            "absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-zinc-800 dark:bg-white",
            "transition-[height] duration-100",
            selectedServerId === server.id ? "h-10" : "h-0 group-hover:h-5",
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
              selectedServerId === server.id
                ? "rounded-xl bg-teal-500 text-white"
                : "dark:bg-zinc-750 rounded-[50%] bg-zinc-100 hover:rounded-xl hover:bg-zinc-200 dark:text-white dark:hover:bg-zinc-700",
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
  );
}
