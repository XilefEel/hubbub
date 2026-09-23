import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full bg-white p-8 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
      Select a channel to get started
    </div>
  );
}
