import ConfirmDialog from "../ui/ConfirmDialog";
import { useDeleteChannel } from "../../hooks/useChannels";
import { useDeleteChannelModal } from "../../stores/useModalStore";

export default function DeleteChannelModal() {
  const { isOpen, serverId, channelId, closeModal, setIsOpen } =
    useDeleteChannelModal();
  const deleteChannel = useDeleteChannel();

  if (!serverId || !channelId) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Delete channel?"
      description="This will permanently delete the channel and all its messages."
      isPending={deleteChannel.isPending}
      onConfirm={() =>
        deleteChannel.mutate({ serverId, channelId }, { onSuccess: closeModal })
      }
    />
  );
}
