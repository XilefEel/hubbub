import { useState } from "react";
import { useUpdateUsernameModal } from "../../stores/useModalStore";
import Dialog from "../ui/Dialog";
import { useAuth, useUpdateUsername } from "../../hooks/useAuth";
import SubmitButton from "../ui/SubmitButton";
import Input from "../ui/Input";

export default function UpdateUsernameModal() {
  const { user } = useAuth();
  const { isOpen, closeModal, setIsOpen } = useUpdateUsernameModal();
  const [name, setName] = useState(user?.name || "");
  const updateUsername = useUpdateUsername();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateUsername.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          closeModal();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Update Username">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New username"
        />

        {updateUsername.isError && (
          <p className="text-sm text-red-500">{updateUsername.error.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <SubmitButton
            disabled={
              updateUsername.isPending ||
              name.trim() === "" ||
              name === user?.name
            }
          >
            Update
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
