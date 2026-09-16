import { useEditChannelModal } from "../../stores/useModalStore";
import Dialog from "../ui/Dialog";
import { EditChannelForm } from "../channels/EditChannelForm";

export default function EditChannelModal() {
  const { isOpen, channelId, channelName, closeModal, setIsOpen } =
    useEditChannelModal();

  if (!channelId || channelName === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Edit channel">
      <EditChannelForm
        channelId={channelId}
        channelName={channelName}
        onSuccess={closeModal}
      />
    </Dialog>
  );
}
