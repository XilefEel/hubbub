import { Reply, Pencil, Trash2 } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { useDeleteMessageModal } from "@/app/modals/useModalStore";

export default function MessageContextMenu({
  messageId,
  isOwner,
  isPending,
  onReply,
  onEdit,
  children,
}: {
  messageId: string;
  isOwner: boolean;
  isPending?: boolean;
  onReply: () => void;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const { openModal } = useDeleteMessageModal();

  return (
    <BaseContextMenu
      content={
        <>
          <ContextMenuItem action={onReply} Icon={Reply} label="Reply" />

          <ContextMenuItem
            action={onEdit}
            Icon={Pencil}
            label="Edit"
            show={isOwner}
            disabled={isPending}
          />

          <ContextMenuSeparator show={isOwner} />

          <ContextMenuItem
            action={() => openModal(messageId)}
            Icon={Trash2}
            label="Delete"
            isDelete
            show={isOwner}
            disabled={isPending}
          />
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
