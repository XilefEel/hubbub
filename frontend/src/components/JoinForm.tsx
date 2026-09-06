import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function JoinServerForm() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");

    try {
      await pb.send("/api/servers/join", {
        method: "POST",
        body: { inviteCode },
      });
      setInviteCode("");
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    } catch (err) {
      console.error(err);
      setError("Failed to join server");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
        className="rounded border px-3 py-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Join server
      </button>
    </form>
  );
}
