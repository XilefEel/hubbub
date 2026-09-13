import { useState } from "react";
import { useJoinServer } from "../../hooks/useServers";

export function JoinServerForm({ onClose }: { onClose: () => void }) {
  const [inviteCode, setInviteCode] = useState("");
  const joinServer = useJoinServer();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    joinServer.mutate(
      { inviteCode },
      {
        onSuccess: () => {
          setInviteCode("");
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <input
        autoFocus
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:outline-none"
      />

      {joinServer.isError && (
        <p className="text-sm text-red-500">{joinServer.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={joinServer.isPending || inviteCode.trim() === ""}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
        >
          Join channel
        </button>
      </div>
    </form>
  );
}
