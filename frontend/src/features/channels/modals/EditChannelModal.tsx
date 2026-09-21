import { useEditChannelModal } from "../../../app/modals/useModalStore";
import Dialog from "../../../components/ui/Dialog";
import { useState } from "react";
import { useUpdateChannel } from "../hooks/useChannels";
import SubmitButton from "../../../components/ui/SubmitButton";
import Input from "../../../components/ui/Input";

export default function EditChannelModal() {
  const { isOpen, channelId, channelName, closeModal, setIsOpen } =
    useEditChannelModal();

  if (!channelId || channelName === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Edit channel">
      <EditChannelForm
        key={channelId}
        channelId={channelId}
        channelName={channelName}
        onSuccess={closeModal}
      />
    </Dialog>
  );
}

function EditChannelForm({
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
