import { useState } from "react";
import { useJoinServer } from "../../hooks/useServers";
import { Input } from "../ui/Input";
import { SubmitButton } from "../ui/SubmitButton";

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
      <Input
        autoFocus
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
      />

      {joinServer.isError && (
        <p className="text-sm text-red-500">{joinServer.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton
          disabled={joinServer.isPending || inviteCode.trim() === ""}
        >
          Join channel
        </SubmitButton>
      </div>
    </form>
  );
}
