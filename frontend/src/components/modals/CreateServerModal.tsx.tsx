import { useCreateServerModal } from "../../stores/useModalStore";
import { CreateServerForm } from "../servers/CreateServerForm";
import Dialog from "../ui/Dialog";

export default function CreateServerModal() {
  const { isOpen, closeModal, setIsOpen } = useCreateServerModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create server">
      <CreateServerForm onClose={closeModal} />
    </Dialog>
  );
}
