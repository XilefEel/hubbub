import { useJoinServerModal } from "../../stores/useModalStore";
import { JoinServerForm } from "../servers/JoinServerForm";
import Dialog from "../ui/Dialog";

export default function JoinServerModal() {
  const { isOpen, closeModal, setIsOpen } = useJoinServerModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Join server">
      <JoinServerForm onClose={closeModal} />
    </Dialog>
  );
}
