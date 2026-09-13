import { useState } from "react";
import { useUpdateChannel } from "../../hooks/useChannels";

export function EditChannelForm({
  channelId,
  channelName,
  onSuccess,
}: {
  channelId: string;
  channelName: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(channelName);
  const editChannel = useUpdateChannel();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    editChannel.mutate(
      { channelId, name },
      {
        onSuccess: () => {
          setName("");
          onSuccess?.();
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
        disabled={editChannel.isPending}
        className="rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:outline-none"
      />

      {editChannel.isError && (
        <p className="text-sm text-red-500">Failed to rename channel</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={
            editChannel.isPending || name.trim() === "" || name === channelName
          }
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
        >
          {editChannel.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
