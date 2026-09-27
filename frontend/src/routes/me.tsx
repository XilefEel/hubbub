import { createFileRoute, Outlet } from "@tanstack/react-router";
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
    <div className="flex h-full bg-white dark:bg-zinc-800">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel id="dm-sidebar" minSize="15%" panelRef={sidebarRef} collapsible>
          <aside className="flex h-full flex-col p-4 text-zinc-900 dark:text-zinc-100">
            hi
          </aside>
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
