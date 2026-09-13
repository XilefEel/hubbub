import { Copy, Edit, Trash } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import { useDeleteChannelModal } from "../../stores/useModalStore";

export function ChannelContextMenu({
  serverId,
  channelId,
  isOwner,
  children,
}: {
  serverId: string;
  channelId: string;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  const { openModal } = useDeleteChannelModal();

  return (
    <BaseContextMenu
      disabled={!isOwner}
      content={
        <>
          <ContextMenuItem action={() => {}} Icon={Edit} label="Edit Channel" />

          <ContextMenuItem
            action={() => {}}
            Icon={Copy}
            label="Duplicate Channel"
          />

          <ContextMenuSeparator />

          <ContextMenuItem
            action={() => openModal(serverId, channelId)}
            Icon={Trash}
            label="Delete Channel"
            isDelete
          />
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
