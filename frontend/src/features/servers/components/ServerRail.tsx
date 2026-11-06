import { useParams } from "@tanstack/react-router";
import { useServers } from "../hooks/useServers";
import { Compass, Plus, Settings } from "lucide-react";
import { cn } from "cn";
import ServerSkeleton from "./ServerSkeleton";
import { useSettingsModal } from "@/features/settings/modals/useSettingsModal";
import { useCreateServerModal } from "../modals/useCreateServerModal";
import { useJoinServerModal } from "../modals/useJoinServerModal";
import { useUnreadConversations } from "@/features/conversations/hooks/useConversations";
import { useEffect } from "react";
import ServerItem from "./ServerItem";
import ServerRailButton from "./ServerRailButton";
import HomeItem from "./HomeItem";

export default function ServerRail() {
  const { serverId } = useParams({ strict: false });

  const { data: servers, isLoading, isError, error } = useServers();
  const { openModal: openCreate } = useCreateServerModal();
  const { openModal: openJoin } = useJoinServerModal();
  const { openModal: openSettings } = useSettingsModal();

  const unread = useUnreadConversations();
  const count = unread.length;

  useEffect(() => {
    document.title = count > 0 ? `(${count}) Hubbub` : "Hubbub";
  }, [count]);

  return (
    <nav
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto py-3",
        "border-r border-zinc-200 dark:border-zinc-700",
        "dark:bg-zinc-850 bg-white",
      )}
    >
      <HomeItem active={serverId === undefined} unread={count} />

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
            <ServerItem
              key={server.id}
              server={server}
              selectedServerId={serverId ?? ""}
            />
          ))}
        </div>
      )}

      <div className="mt-auto w-12 border-t border-zinc-200 dark:border-zinc-700" />

      <ServerRailButton
        label="Create server"
        Icon={Plus}
        onClick={openCreate}
      />

      <ServerRailButton label="Join server" Icon={Compass} onClick={openJoin} />

      <ServerRailButton
        label="Settings"
        Icon={Settings}
        onClick={openSettings}
      />
    </nav>
  );
}
