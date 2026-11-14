import { useUIActions } from "@/app/stores/useUIStore";
import Tooltip from "@/components/ui/Tooltip";
import ConversationList from "@/features/conversations/components/ConversationList";
import { usePanelSync } from "@/features/conversations/hooks/usePanelSync";
import VoiceToolbar from "@/features/voice/components/VoiceToolbar";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PanelLeft, UsersRound } from "lucide-react";
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

  const { handleConversationsResize } = usePanelSync({
    sidebarRef,
  });

  const { toggleConversations } = useUIActions();

  return (
    <div className="flex h-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel
          id="dm-sidebar"
          minSize="20%"
          panelRef={sidebarRef}
          onResize={handleConversationsResize}
          collapsible
        >
          <div className="dark:bg-zinc-850 flex h-full min-w-56 flex-col bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <Link
                to="/me"
                className="dark:hover:bg-zinc-750 flex w-full items-center gap-2 rounded px-2 py-1 transition-colors duration-100 hover:bg-zinc-50"
              >
                <UsersRound className="size-4" />
                Friends
              </Link>

              <Tooltip content="Hide Conversations">
                <button
                  onClick={toggleConversations}
                  className="text-sm transition-colors duration-100 hover:text-teal-500 dark:hover:text-teal-400"
                >
                  <PanelLeft className="size-4 shrink-0" />
                </button>
              </Tooltip>
            </div>

            <div className="my-3 shrink-0 border-t border-zinc-200 dark:border-zinc-700" />

            <ConversationList />

            <div className="mt-auto">
              <VoiceToolbar />
            </div>
          </div>
        </Panel>

        <Separator className="w-px cursor-col-resize border-l border-zinc-200 transition-colors duration-100 hover:border-teal-400 dark:border-transparent dark:hover:border-teal-500" />

        <Panel id="main-content" minSize="50%">
          <main className="h-full bg-white dark:bg-zinc-800">
            <Outlet />
          </main>
        </Panel>
      </Group>
    </div>
  );
}
