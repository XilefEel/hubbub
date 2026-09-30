import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AddFriendInput from "@/features/friends/components/AddFriendInput";
import PendingRequests from "@/features/friends/components/PendingRequests";
import FriendsList from "@/features/friends/components/FriendList";
import { cn } from "cn";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "add", label: "Add Friend" },
];

export const Route = createFileRoute("/me/")({
  component: FriendsPage,
});

function FriendsPage() {
  const [tab, setTab] = useState<"all" | "pending" | "add">("all");

  return (
    <section className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-4 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-2 dark:border-zinc-700">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as "all" | "pending" | "add")}
            className={cn(
              "flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors duration-100",
              tab === id
                ? "dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "all" && <FriendsList />}
      {tab === "pending" && <PendingRequests />}
      {tab === "add" && <AddFriendInput />}
    </section>
  );
}
