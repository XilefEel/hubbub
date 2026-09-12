import { useState } from "react";
import { useJoinServer } from "../../hooks/useServers";

export function JoinServerForm() {
  const [inviteCode, setInviteCode] = useState("");
  const joinServer = useJoinServer();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    joinServer.mutate(
      { inviteCode },
      {
        onSuccess: () => {
          setInviteCode("");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
        className="rounded border px-3 py-2"
      />

      {joinServer.isError && (
        <p className="text-sm text-red-500">
          Failed to join server: {joinServer.error.message}
        </p>
      )}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Join server
      </button>
    </form>
  );
}
