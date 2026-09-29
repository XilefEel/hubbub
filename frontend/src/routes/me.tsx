import AddFriendInput from "@/features/friends/components/AddFriendInput";
import {
  useFriendships,
  useRespondToFriendRequest,
} from "@/features/friends/hooks/useFriendships";
import { pb } from "@/lib/pocketbase";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
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
  const userId = pb.authStore.record?.id;

  const sidebarRef = useRef<PanelImperativeHandle>(null);

  const { data: friendships } = useFriendships(userId);
  const respondToFriendRequest = useRespondToFriendRequest();

  const handleAccept = (friendshipId: string) => {
    respondToFriendRequest.mutate({ friendshipId, accept: true });
  };

  const handleIgnore = (friendshipId: string) => {
    respondToFriendRequest.mutate({ friendshipId, accept: false });
  };

  const incomingPending =
    friendships?.filter(
      (f) => f.status === "pending" && f.addressee === userId,
    ) ?? [];

  const outgoingPending =
    friendships?.filter(
      (f) => f.status === "pending" && f.requester === userId,
    ) ?? [];

  const accepted = friendships?.filter((f) => f.status === "accepted") ?? [];

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "hubbub-dm-layout",
    storage: localStorage,
  });

  const navigate = useNavigate();

  const handleOpen = async (otherUserId: string) => {
    const res = await pb.send<{ conversationId: string }>("/api/dms/open", {
      method: "POST",
      body: { userId: otherUserId },
    });

    const conversationId = res.conversationId;

    navigate({
      to: "/me/conversations/$conversationId",
      params: { conversationId },
    });
  };

  return (
    <div className="flex h-full bg-white dark:bg-zinc-800">
      <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
        <Panel id="dm-sidebar" minSize="15%" panelRef={sidebarRef} collapsible>
          <aside className="flex h-full flex-col gap-4 p-4 text-zinc-900 dark:text-zinc-100">
            <AddFriendInput />

            <div className="flex flex-col gap-1 text-sm">
              <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
                Incoming Friend Requests
              </h2>

              {incomingPending.length > 0 &&
                incomingPending.map((f) => (
                  <div key={f.id} className="flex">
                    <span>{f.expand?.requester?.name}</span>

                    <button
                      onClick={() => handleAccept(f.id)}
                      className="ml-auto text-xs"
                    >
                      accept
                    </button>

                    <button
                      onClick={() => handleIgnore(f.id)}
                      className="ml-1 text-xs"
                    >
                      ignore
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
                Outgoing Friend Requests
              </h2>

              {outgoingPending.length > 0 &&
                outgoingPending.map((f) => (
                  <div key={f.id} className="flex">
                    <span>{f.expand?.addressee?.name}</span>

                    <button
                      onClick={() => handleIgnore(f.id)}
                      className="ml-auto text-xs"
                    >
                      cancel
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <h2 className="font-semibold text-zinc-500 dark:text-zinc-400">
                Friends
              </h2>

              {accepted.length > 0 &&
                accepted.map((f) => {
                  const friend =
                    f.requester === userId
                      ? f.expand?.addressee
                      : f.expand?.requester;

                  return (
                    <span
                      onClick={() => friend && handleOpen(friend.id)}
                      key={f.id}
                    >
                      {friend?.name}
                    </span>
                  );
                })}
            </div>
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
