import { useDeleteMessageModal } from "../../stores/useModalStore";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useDeleteMessage } from "../../hooks/useMessages";

export default function DeleteMessageModal() {
  const { isOpen, messageId, closeModal, setIsOpen } = useDeleteMessageModal();
  const deleteMessage = useDeleteMessage();

  if (!messageId) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Delete message?"
      description="This action cannot be undone."
      isPending={deleteMessage.isPending}
      onConfirm={() =>
        deleteMessage.mutate(messageId, { onSuccess: closeModal })
      }
    />
  );
}
