import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "../../lib/pocketbase";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { queryKeys } from "../../lib/querykeys";

export function CreateChannelForm({ serverId }: { serverId: string }) {
  const { isOwner } = useCurrentMembership(serverId);

  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!isOwner) return;
    setError("");

    try {
      await pb.collection("channels").create({ name, server: serverId, type });
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels.list(serverId),
      });
      setName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create channel");
    }
  }

  if (isOwner)
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel name"
          className="rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:outline-none"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "text" | "voice")}
          className="rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:outline-none"
        >
          <option value="text">Text</option>
          <option value="voice">Voice</option>
        </select>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-teal-500 px-3 py-1 text-white"
        >
          Create channel
        </button>
      </form>
    );

  return null;
}
