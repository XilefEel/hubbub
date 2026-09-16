import { useDeleteServerModal } from "../../stores/useModalStore";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useDeleteServer } from "../../hooks/useServers";

export default function DeleteServerModal() {
  const { isOpen, serverId, closeModal } = useDeleteServerModal();
  const deleteServer = useDeleteServer();

  if (!isOpen || !serverId) return null;

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Delete server?"
      description="This will permanently delete the server and all its channels and messages."
      isPending={deleteServer.isPending}
      onConfirm={() => deleteServer.mutate(serverId, { onSuccess: closeModal })}
    />
  );
}
