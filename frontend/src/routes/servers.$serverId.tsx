import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useServerDetail } from "../hooks/useServers";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import { ChannelList } from "../components/channels/ChannelList";
import { MemberList } from "../components/servers/MemberList";

export const Route = createFileRoute("/servers/$serverId")({
  component: ServerPage,
});

function ServerPage() {
  const { serverId } = Route.useParams();
  const { data: server, isLoading, isError, error } = useServerDetail(serverId);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "hubbub-layout",
    storage: localStorage,
  });

  if (isLoading) return <p>Loading server...</p>;

  if (isError)
    return (
      <p className="text-red-500">Failed to load server: {error.message}</p>
    );

  return (
    <div className="flex h-screen">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel id="channels-sidebar" minSize="15%">
          <aside className="flex h-full flex-col gap-4 p-4">
            <div className="flex flex-col gap-0.5">
              <Link
                to="/"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                <ArrowLeft className="size-3 shrink-0" /> Back to servers
              </Link>

              <h1 className="text-xl font-bold">{server?.name}</h1>

              <p className="text-sm text-zinc-500">
                Invite code: {server?.inviteCode}
              </p>
            </div>

            <ChannelList serverId={serverId} />
          </aside>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400" />

        <Panel id="main-content" minSize="15%">
          <main className="h-full">
            <Outlet />
          </main>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 hover:border-teal-400" />

        <Panel id="members-sidebar" minSize="15%">
          <aside className="flex h-full flex-col gap-2 p-4">
            <MemberList serverId={serverId} />
          </aside>
        </Panel>
      </Group>
    </div>
  );
}
