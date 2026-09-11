import { useState } from "react";
import { useCreateServer } from "../../hooks/useServers";

export function CreateServerForm() {
  const [name, setName] = useState("");
  const createServer = useCreateServer();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    createServer.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Server name"
        className="rounded border px-3 py-2"
      />

      {createServer.isError && (
        <p className="text-sm text-red-500">{createServer.error.message}</p>
      )}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Create server
      </button>
    </form>
  );
}
