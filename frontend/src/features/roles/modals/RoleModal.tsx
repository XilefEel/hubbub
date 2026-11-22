import Dialog from "@/components/ui/Dialog";
import { useRoleModal } from "./useRoleModal";
import RoleForm from "../components/RoleForm";
import RoleManager from "../components/RoleManager";
import { useState } from "react";
import type { Role } from "@/lib/types";

export default function RoleModal() {
  const { isOpen, serverId, closeModal, setIsOpen } = useRoleModal();

  return (
    <Dialog
      title="Manage server roles"
      open={isOpen}
      onOpenChange={setIsOpen}
      width="max-w-3xl"
    >
      {serverId && (
        <RoleModalContent
          key={serverId}
          serverId={serverId}
          closeModal={closeModal}
        />
      )}
    </Dialog>
  );
}

function RoleModalContent({
  serverId,
  closeModal,
}: {
  serverId: string;
  closeModal: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  return (
    <div className="flex">
      <RoleManager
        serverId={serverId}
        setSelectedRole={setSelectedRole}
        setMode={setMode}
      />
      <RoleForm
        key={selectedRole?.id ?? "new"}
        serverId={serverId}
        closeModal={closeModal}
        selectedRole={selectedRole}
        mode={mode}
      />
    </div>
  );
}
