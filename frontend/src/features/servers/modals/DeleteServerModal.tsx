import { useDeleteServerModal } from "@/app/modals/useModalStore";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useDeleteServer } from "../hooks/useServers";

export default function DeleteServerModal() {
  const { isOpen, serverId, closeModal, setIsOpen } = useDeleteServerModal();
  const deleteServer = useDeleteServer();

  if (!serverId) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Delete server?"
      description="This will permanently delete the server and all its channels and messages."
      isPending={deleteServer.isPending}
      onConfirm={() => deleteServer.mutate(serverId, { onSuccess: closeModal })}
    />
  );
}
