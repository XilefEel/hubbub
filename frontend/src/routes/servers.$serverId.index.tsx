import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/servers/$serverId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8 text-zinc-400">Select a channel to get started</div>
  );
}
