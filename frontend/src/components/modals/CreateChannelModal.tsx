import { useCreateChannelModal } from "../../stores/useModalStore";
import { CreateChannelForm } from "../channels/CreateChannelForm";
import { Dialog } from "../ui/Dialog";

export default function CreateChannelModal() {
  const { isOpen, serverId, closeModal } = useCreateChannelModal();

  if (!isOpen || !serverId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Create channel">
      <CreateChannelForm serverId={serverId} onSuccess={closeModal} />
    </Dialog>
  );
}
