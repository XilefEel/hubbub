import type { Role } from "@/lib/types";
import { useReorderRoles, useRoles } from "../hooks/useRoles";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useServerDetail } from "@/features/servers/hooks/useServers";
import { pb } from "@/lib/pocketbase";

export default function RoleManager({
  serverId,
  setSelectedRole,
  setMode,
}: {
  serverId: string;
  setSelectedRole: (role: Role | null) => void;
  setMode: (mode: "create" | "edit") => void;
}) {
  const { data: server } = useServerDetail(serverId);

  const { data: roles } = useRoles(serverId);
  const reorder = useReorderRoles(serverId);

  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetId: string) => {
    if (!roles || !dragId || dragId === targetId) return;
    const ids = roles.map((role) => role.id);

    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);

    ids.splice(from, 1);
    ids.splice(to, 0, dragId);

    reorder.mutate(ids);
    setDragId(null);
  };

  const isOwner = server?.owner === pb.authStore.record?.id;

  return (
    <div className="mr-4 flex w-60 flex-col gap-1 overflow-y-auto border-r border-zinc-200 pr-2 text-sm dark:border-zinc-700">
      <div className="mb-2 px-2">
        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
          Roles ({roles?.length ?? 0})
        </p>

        {isOwner && (
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Drag to reorder. Roles higher in the list can manage roles below
            them.
          </p>
        )}
      </div>

      {roles?.map((role) => (
        <button
          key={role.id}
          draggable={isOwner}
          onDragStart={() => setDragId(role.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(role.id)}
          onDragEnd={() => setDragId(null)}
          onClick={() => {
            setSelectedRole(role);
            setMode("edit");
          }}
          className="dark:hover:bg-zinc-750 flex rounded-md px-2 py-1 hover:bg-zinc-50"
        >
          @{role.name}
        </button>
      ))}

      <button
        onClick={() => {
          setSelectedRole(null);
          setMode("create");
        }}
        className="dark:hover:bg-zinc-750 flex items-center gap-1 rounded-md px-2 py-1 hover:bg-zinc-50"
      >
        <Plus className="size-3.5 shrink-0" /> Create new role
      </button>
    </div>
  );
}
