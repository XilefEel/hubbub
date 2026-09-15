import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-8">
      <button
        onClick={() => {
          pb.authStore.clear();
          navigate({ to: "/login" });
        }}
        className="mt-2 text-sm underline"
      >
        Log out
      </button>
    </div>
  );
}
