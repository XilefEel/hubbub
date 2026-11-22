import { Reply, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { useDeleteMessageModal } from "../modals/useDeleteMessageModal";

export default function MessageContextMenu({
  messageId,
  isAuthor,
  isPending,
  onReply,
  onEdit,
  canManageMessages,
  children,
}: {
  messageId: string;
  isAuthor: boolean;
  isPending?: boolean;
  onReply: () => void;
  onEdit: () => void;
  canManageMessages: boolean;
  children: React.ReactNode;
}) {
  const { openModal } = useDeleteMessageModal();
  const canDelete = isAuthor || canManageMessages;

  return (
    <ContextMenu
      content={
        <>
          <ContextMenuItem action={onReply} Icon={Reply} label="Reply" />

          <ContextMenuItem
            action={onEdit}
            Icon={Pencil}
            label="Edit"
            show={isAuthor}
            disabled={isPending}
          />

          <ContextMenuSeparator show={canDelete} />

          <ContextMenuItem
            action={() => openModal(messageId)}
            Icon={Trash2}
            label="Delete"
            isDelete
            show={canDelete}
            disabled={isPending}
          />
        </>
      }
    >
      {children}
    </ContextMenu>
  );
}
