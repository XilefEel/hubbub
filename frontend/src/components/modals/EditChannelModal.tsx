import { useEditChannelModal } from "../../stores/useModalStore";
import Dialog from "../ui/Dialog";
import { EditChannelForm } from "../channels/EditChannelForm";

export default function EditChannelModal() {
  const { isOpen, channelId, channelName, closeModal } = useEditChannelModal();

  if (!isOpen || !channelId || channelName === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Edit channel">
      <EditChannelForm
        channelId={channelId}
        channelName={channelName}
        onSuccess={closeModal}
      />
    </Dialog>
  );
}
