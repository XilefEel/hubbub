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

  const { handleLeftbarResize, handleRightbarResize } = usePanelSync({
    channelsRef,
    membersRef,
  });

  const { toggleLeftbar } = useUIActions();

  if (isLoading) return <p>Loading server...</p>;

  if (isError)
    return (
      <p className="text-red-500">Failed to load server: {error.message}</p>
    );

  return (
    <div className="flex h-full">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel
          id="channels-sidebar"
          minSize="15%"
          panelRef={channelsRef}
          onResize={handleLeftbarResize}
          collapsible
        >
          <aside className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{server?.name}</h1>

              <Tooltip content="Toggle Leftbar">
                <button
                  onClick={toggleLeftbar}
                  className="text-sm hover:text-teal-500"
                >
                  <PanelLeft className="size-4 shrink-0" />
                </button>
              </Tooltip>
            </div>

            <p className="mb-4 text-sm text-zinc-500">
              Invite code: {server?.inviteCode}
            </p>

            <ChannelList serverId={serverId} />
          </aside>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400" />

        <Panel id="main-content" minSize="50%">
          <main className="h-full">
            <Outlet />
          </main>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400" />

        <Panel
          id="members-sidebar"
          minSize="15%"
          panelRef={membersRef}
          onResize={handleRightbarResize}
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
