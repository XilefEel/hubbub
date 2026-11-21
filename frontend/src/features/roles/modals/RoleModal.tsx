import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import { Perm, useCreateRole } from "../hooks/useRoles";
import { useRoleModal } from "./useRoleModal";
import ColorPicker from "@/components/ui/ColorPicker";
import Checkbox from "@/components/ui/Checkbox";
import { DEFAULT_COLOR } from "@/lib/constants";

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

export default function RoleModal() {
  const { isOpen, serverId, closeModal, setIsOpen } = useRoleModal();

  return (
    <Dialog
      title="Create role"
      open={isOpen}
      onOpenChange={setIsOpen}
      width="max-w-xl"
    >
      {serverId && (
        <RoleForm key={serverId} serverId={serverId} closeModal={closeModal} />
      )}
    </Dialog>
  );
}

function RoleForm({
  serverId,
  closeModal,
}: {
  serverId: string;
  closeModal: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [mentionable, setMentionable] = useState(false);
  const [permissions, setPermissions] = useState(0);

  const createRole = useCreateRole(serverId);

  const togglePerm = (bit: number) => setPermissions((p) => p ^ bit);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    createRole.mutate(
      { name: name.trim(), color, permissions, mentionable },
      { onSuccess: closeModal },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
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
          Create role
        </SubmitButton>
      </div>
    </form>
  );
}
