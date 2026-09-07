import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function CreateChannelForm({ serverId }: { serverId: string }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");

    try {
      await pb.collection("channels").create({ name, server: serverId, type });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create server");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Server name"
        className="rounded border px-3 py-2"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as "text" | "voice")}
        className="rounded border px-3 py-2"
      >
        <option value="text">Text</option>
        <option value="voice">Voice</option>
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Create server
      </button>
    </form>
  );
}
