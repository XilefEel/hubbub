import { Reply, Pencil, Trash2 } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import { useDeleteMessageModal } from "../../stores/useModalStore";

export function MessageContextMenu({
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
          {isOwner && (
            <>
              <ContextMenuItem
                action={onEdit}
                Icon={Pencil}
                label="Edit"
                disabled={isPending}
              />

              <ContextMenuSeparator />

              <ContextMenuItem
                action={() => openModal(messageId)}
                Icon={Trash2}
                label="Delete"
                isDelete
                disabled={isPending}
              />
            </>
          )}
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
