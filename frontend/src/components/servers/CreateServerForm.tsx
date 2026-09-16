import { useState } from "react";
import { useCreateServer } from "../../hooks/useServers";

export function CreateServerForm({ onClose }: { onClose: () => void }) {
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
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:outline-none dark:border-zinc-700"
      />

      {createServer.isError && (
        <p className="text-sm text-red-500">{createServer.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={createServer.isPending || name.trim() === ""}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
        >
          Create channel
        </button>
      </div>
    </form>
  );
}
