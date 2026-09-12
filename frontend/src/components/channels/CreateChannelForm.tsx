import { useState } from "react";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { useCreateChannel } from "../../hooks/useChannels";

export function CreateChannelForm({
  serverId,
  onSuccess,
}: {
  serverId: string;
  onSuccess?: () => void;
}) {
  const { isOwner } = useCurrentMembership(serverId);

  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");

  const createChannel = useCreateChannel(serverId);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    createChannel.mutate(
      { name, type },
      {
        onSuccess: () => {
          setName("");
          onSuccess?.();
        },
      },
    );
  };

  if (!isOwner) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "text" | "voice")}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:outline-none"
      >
        <option value="text">Text</option>
        <option value="voice">Voice</option>
      </select>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:outline-none"
      />

      {createChannel.isError && (
        <p className="text-sm text-red-500">{createChannel.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-white"
        >
          Create channel
        </button>
      </div>
    </form>
  );
}
