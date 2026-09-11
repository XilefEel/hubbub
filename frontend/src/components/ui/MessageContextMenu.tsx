import { Reply, Pencil, Trash2 } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";

export function MessageContextMenu({
  isOwner,
  isPending,
  onReply,
  onEdit,
  onDelete,
  children,
}: {
  isOwner: boolean;
  isPending?: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
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
                action={onDelete}
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
