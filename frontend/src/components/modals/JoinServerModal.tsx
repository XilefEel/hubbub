import { useJoinServerModal } from "../../stores/useModalStore";
import { JoinServerForm } from "../servers/JoinServerForm";
import Dialog from "../ui/Dialog";

export default function JoinServerModal() {
  const { isOpen, closeModal } = useJoinServerModal();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Join server">
      <JoinServerForm onClose={closeModal} />
    </Dialog>
  );
}
