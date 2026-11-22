import ColorPicker from "@/components/ui/ColorPicker";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import { DEFAULT_COLOR } from "@/lib/constants";
import { useState } from "react";
import { useCreateRole, Perm, useUpdateRole } from "../hooks/useRoles";
import Checkbox from "@/components/ui/Checkbox";
import type { Role } from "@/lib/types";

const PERM_LABELS: Record<keyof typeof Perm, string> = {
  Administrator: "Administrator",
  ManageServer: "Manage Server",
  ManageChannels: "Manage Channels",
  ManageRoles: "Manage Roles",
  ManageMessages: "Manage Messages",
  KickMembers: "Kick Members",
  BanMembers: "Ban Members",
  MentionEveryone: "Mention Everyone",
};

export default function RoleForm({
  serverId,
  closeModal,
  selectedRole,
  mode,
}: {
  serverId: string;
  closeModal: () => void;
  selectedRole: Role | null;
  mode: "create" | "edit";
}) {
  const [name, setName] = useState(selectedRole?.name ?? "");
  const [color, setColor] = useState(selectedRole?.color || DEFAULT_COLOR);
  const [mentionable, setMentionable] = useState(
    selectedRole?.mentionable ?? false,
  );
  const [permissions, setPermissions] = useState(
    selectedRole?.permissions ?? 0,
  );

  const createRole = useCreateRole(serverId);
  const updateRole = useUpdateRole(serverId);

  const togglePerm = (bit: number) => setPermissions((p) => p ^ bit);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (mode === "edit") {
      if (!selectedRole) return;

      updateRole.mutate(
        {
          roleId: selectedRole.id,
          name: name.trim(),
          color,
          permissions,
          mentionable,
        },
        { onSuccess: closeModal },
      );

      return;
    }

    createRole.mutate(
      { name: name.trim(), color, permissions, mentionable },
      { onSuccess: closeModal },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col gap-4 text-sm"
    >
      <div className="flex flex-col items-center gap-3">
        <ColorPicker currentColor={color} onColorSelect={setColor}>
          <div
            style={{ backgroundColor: color }}
            className="h-16 w-full rounded-lg transition-opacity duration-100 hover:opacity-80"
          />
        </ColorPicker>

        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Role name"
          maxLength={32}
        />
      </div>

      <label className="flex items-center gap-2 px-2">
        <Checkbox
          checked={mentionable}
          onCheckedChange={(e) => setMentionable(!!e)}
        />
        Allow anyone to @mention this role
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 font-medium">Permissions</legend>

        {Object.entries(Perm).map(([key, bit]) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Checkbox
              checked={(permissions & bit) !== 0}
              onCheckedChange={() => togglePerm(bit)}
            />

            {PERM_LABELS[key as keyof typeof Perm]}
          </label>
        ))}
      </fieldset>

      {createRole.isError && (
        <p className="text-red-500">
          {createRole.error instanceof Error
            ? createRole.error.message
            : "An error occurred while creating the role."}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton disabled={createRole.isPending || name.trim() === ""}>
          {mode === "edit" ? "Save Changes" : "Create Role"}
        </SubmitButton>
      </div>
    </form>
  );
}
