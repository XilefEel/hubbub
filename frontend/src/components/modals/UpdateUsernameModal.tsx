import { useState } from "react";
import { useUpdateUsernameModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";
import { useAuth, useUpdateUsername } from "../../hooks/useAuth";

export default function UpdateUsernameModal() {
  const { user } = useAuth();
  const { isOpen, closeModal } = useUpdateUsernameModal();
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Update Username">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New username"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:outline-none"
        />

        {updateUsername.isError && (
          <p className="text-sm text-red-500">{updateUsername.error.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={
              updateUsername.isPending ||
              name.trim() === "" ||
              name === user?.name
            }
            className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </form>
    </Dialog>
  );
}
