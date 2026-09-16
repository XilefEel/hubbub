import { useState } from "react";
import { useUpdateChannel } from "../../hooks/useChannels";
import SubmitButton from "../ui/SubmitButton";
import Input from "../ui/Input";

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
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
        disabled={editChannel.isPending}
      />

      {editChannel.isError && (
        <p className="text-sm text-red-500">Failed to rename channel</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton
          disabled={
            editChannel.isPending || name.trim() === "" || name === channelName
          }
        >
          {editChannel.isPending ? "Saving..." : "Save"}
        </SubmitButton>
      </div>
    </form>
  );
}
