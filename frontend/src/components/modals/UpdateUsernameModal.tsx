import { useState } from "react";
import { useUpdateUsernameModal } from "../../stores/useModalStore";
import { useAuth, useUpdateUsername } from "../../hooks/useAuth";
import Dialog from "../ui/Dialog";
import SubmitButton from "../ui/SubmitButton";
import Input from "../ui/Input";

export default function UpdateUsernameModal() {
  const { user } = useAuth();
  const { isOpen, closeModal, setIsOpen } = useUpdateUsernameModal();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Update Username">
      <UpdateUsernameForm currentName={user.name} onSuccess={closeModal} />
    </Dialog>
  );
}

function UpdateUsernameForm({
  currentName,
  onSuccess,
}: {
  currentName: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(currentName);
  const updateUsername = useUpdateUsername();

  const trimmed = name.trim();
  const canSave = trimmed !== "" && trimmed !== currentName;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateUsername.mutate({ name: trimmed }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New username"
        disabled={updateUsername.isPending}
      />

      {updateUsername.isError && (
        <p className="text-sm text-red-500">{updateUsername.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton disabled={updateUsername.isPending || !canSave}>
          {updateUsername.isPending ? "Saving..." : "Update"}
        </SubmitButton>
      </div>
    </form>
  );
}
