import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";
import { CreateServerForm } from "../components/servers/CreateServerForm";
import { JoinServerForm } from "../components/servers/JoinServerForm";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-8">
      <div>
        <p>Welcome back {user?.name}</p>
        <p>Email: {user?.email}</p>

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

      <CreateServerForm />
      <JoinServerForm />
    </div>
  );
}
