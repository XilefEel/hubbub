import { createFileRoute } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p>Welcome back {user?.name}</p>
      <p>Email: {user?.email}</p>

      <button
        onClick={() => pb.authStore.clear()}
        className="mt-2 text-sm underline"
      >
        Log out
      </button>
    </div>
  );
}
