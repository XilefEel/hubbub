import ConversationList from "@/features/conversations/components/ConversationList";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { useRef } from "react";
import {
  type PanelImperativeHandle,
  useDefaultLayout,
  Panel,
  Separator,
  Group,
} from "react-resizable-panels";

export const Route = createFileRoute("/me")({
  component: MePage,
});

function MePage() {
  const sidebarRef = useRef<PanelImperativeHandle>(null);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "hubbub-dm-layout",
    storage: localStorage,
  });

  return (
    <div className="flex h-full bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel
          id="dm-sidebar"
          minSize="15%"
          panelRef={sidebarRef}
          collapsible
          className="p-4"
        >
          <Link
            to="/me"
            className="flex w-full items-center gap-2 rounded px-2 py-1 transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
          >
            <UsersRound className="size-4" />
            Friends
          </Link>

          <div className="my-3 shrink-0 border-t border-zinc-200 dark:border-zinc-700" />

          <ConversationList />
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 transition-colors duration-100 hover:border-teal-400 dark:border-zinc-700 dark:hover:border-teal-500" />

        <Panel id="main-content" minSize="50%">
          <main className="h-full">
            <Outlet />
          </main>
        </Panel>
      </Group>
    </div>
  );
}
