import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";
import { CreateServerForm } from "../components/CreateServerForm";
import { ServerList } from "../components/ServerList";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-8">
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
      <ServerList />
    </div>
  );
}
