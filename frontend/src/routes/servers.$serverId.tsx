import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerDetail } from "../hooks/useServers";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { ChannelList } from "../components/channels/ChannelList";
import { MemberList } from "../components/servers/MemberList";
import { PanelLeft } from "lucide-react";
import { Tooltip } from "../components/ui/Tooltip";
import { useRef } from "react";
import { usePanelSync } from "../hooks/usePanelSync";
import { useUIActions } from "../stores/useUIStore";

export const Route = createFileRoute("/servers/$serverId")({
  component: ServerPage,
});

function ServerPage() {
  const { serverId } = Route.useParams();
  const { data: server, isLoading, isError, error } = useServerDetail(serverId);

  const channelsRef = useRef<PanelImperativeHandle>(null);
  const membersRef = useRef<PanelImperativeHandle>(null);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "hubbub-layout",
    storage: localStorage,
  });

  const { handleChannelsResize, handleMembersResize } = usePanelSync({
    channelsRef,
    membersRef,
  });

  const { toggleChannels } = useUIActions();

  if (isLoading)
    return (
      <div className="h-full bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        Loading...
      </div>
    );

  if (isError)
    return (
      <p className="h-full bg-white text-red-500 dark:bg-zinc-800">
        Failed to load server: {error.message}
      </p>
    );

  return (
    <div className="flex h-full bg-white dark:bg-zinc-800">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel
          id="channels-sidebar"
          minSize="15%"
          panelRef={channelsRef}
          onResize={handleChannelsResize}
          collapsible
        >
          <aside className="flex h-full flex-col p-4 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{server?.name}</h1>

              <Tooltip content="Hide Channels">
                <button
                  onClick={toggleChannels}
                  className="text-sm hover:text-teal-500 dark:hover:text-teal-400"
                >
                  <PanelLeft className="size-4 shrink-0" />
                </button>
              </Tooltip>
            </div>

            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Invite code: {server?.inviteCode}
            </p>

            <ChannelList serverId={serverId} />
          </aside>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400 dark:border-zinc-700 dark:hover:border-teal-500" />

        <Panel id="main-content" minSize="50%">
          <main className="h-full">
            <Outlet />
          </main>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400 dark:border-zinc-700 dark:hover:border-teal-500" />

        <Panel
          id="members-sidebar"
          minSize="15%"
          panelRef={membersRef}
          onResize={handleMembersResize}
          collapsible
        >
          <aside className="flex h-full flex-col gap-2 p-4">
            <MemberList serverId={serverId} />
          </aside>
        </Panel>
      </Group>
    </div>
  );
}
