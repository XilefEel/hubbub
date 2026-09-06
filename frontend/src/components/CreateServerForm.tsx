import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10);
}

export function CreateServerForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");

    try {
      await pb.collection("servers").create({
        name,
        owner: pb.authStore.record?.id,
        inviteCode: generateInviteCode(),
      });
      setName("");
      queryClient.invalidateQueries({ queryKey: ["servers"] });
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
