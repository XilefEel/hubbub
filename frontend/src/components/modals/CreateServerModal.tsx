import { useCreateServerModal } from "../../stores/useModalStore";
import Dialog from "../ui/Dialog";
import { useState } from "react";
import { useCreateServer } from "../../hooks/useServers";
import Input from "../ui/Input";
import SubmitButton from "../ui/SubmitButton";

export default function CreateServerModal() {
  const { isOpen, closeModal, setIsOpen } = useCreateServerModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create server">
      <CreateServerForm onClose={closeModal} />
    </Dialog>
  );
}

function CreateServerForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const createServer = useCreateServer();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    createServer.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
      />

      {createServer.isError && (
        <p className="text-sm text-red-500">{createServer.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton disabled={createServer.isPending || name.trim() === ""}>
          Create channel
        </SubmitButton>
      </div>
    </form>
  );
}
