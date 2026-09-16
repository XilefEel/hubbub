import { useDeleteMessageModal } from "../../stores/useModalStore";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useDeleteMessage } from "../../hooks/useMessages";

export default function DeleteMessageModal() {
  const { isOpen, messageId, closeModal } = useDeleteMessageModal();
  const deleteMessage = useDeleteMessage();

  if (!isOpen || !messageId) return null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Delete message?"
      description="This action cannot be undone."
      isPending={deleteMessage.isPending}
      onConfirm={() =>
        deleteMessage.mutate(messageId, { onSuccess: closeModal })
      }
    />
  );
}
