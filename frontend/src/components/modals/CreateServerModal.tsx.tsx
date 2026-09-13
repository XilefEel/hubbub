import { useCreateServerModal } from "../../stores/useModalStore";
import { CreateServerForm } from "../servers/CreateServerForm";
import { Dialog } from "../ui/Dialog";

export default function CreateServerModal() {
  const { isOpen, closeModal } = useCreateServerModal();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Create server">
      <CreateServerForm onClose={closeModal} />
    </Dialog>
  );
}
