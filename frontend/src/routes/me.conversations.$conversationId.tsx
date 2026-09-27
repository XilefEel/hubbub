import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/me/conversations/$conversationId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-zinc-900 dark:text-zinc-100">
      Hello "/me/conversations/$conversationId"!
    </div>
  );
}
