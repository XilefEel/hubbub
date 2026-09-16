import { useCreateChannelModal } from "../../stores/useModalStore";
import { CreateChannelForm } from "../channels/CreateChannelForm";
import Dialog from "../ui/Dialog";

export default function CreateChannelModal() {
  const { isOpen, serverId, closeModal, setIsOpen } = useCreateChannelModal();

  if (!serverId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create channel">
      <CreateChannelForm serverId={serverId} onSuccess={closeModal} />
    </Dialog>
  );
}
