import type { Role } from "@/lib/types";
import { useRoles } from "../hooks/useRoles";
import { cn } from "cn";
import { Plus } from "lucide-react";

export default function RoleManager({
  serverId,
  setSelectedRole,
  setMode,
}: {
  serverId: string;
  setSelectedRole: (role: Role | null) => void;
  setMode: (mode: "create" | "edit") => void;
}) {
  const { data: roles } = useRoles(serverId);

  return (
    <div className="mr-4 flex w-60 flex-col gap-1 overflow-y-auto border-r border-zinc-200 pr-2 text-sm dark:border-zinc-700">
      {roles?.map((role) => (
        <button
          key={role.id}
          onClick={() => {
            setSelectedRole(role);
            setMode("edit");
          }}
          className={cn(
            "dark:hover:bg-zinc-750 flex rounded-md px-2 py-1 hover:bg-zinc-50",
          )}
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
        <Plus className="size-3 shrink-0" /> Create new role
      </button>
    </div>
  );
}
