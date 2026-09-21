import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useDeleteChannel } from "../hooks/useChannels";
import { useDeleteChannelModal } from "../../../app/modals/useModalStore";

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
