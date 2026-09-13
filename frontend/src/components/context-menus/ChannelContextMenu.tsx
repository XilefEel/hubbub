import { Copy, Edit, Trash } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import {
  useDeleteChannelModal,
  useEditChannelModal,
} from "../../stores/useModalStore";
import type { Channel } from "../../lib/types";

export function ChannelContextMenu({
  channel,
  serverId,
  isOwner,
  children,
}: {
  channel: Channel;
  serverId: string;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  const { openModal: openEdit } = useEditChannelModal();
  const { openModal: openDelete } = useDeleteChannelModal();

  return (
    <BaseContextMenu
      disabled={!isOwner}
      content={
        <>
          <ContextMenuItem
            action={() => openEdit(channel.id, channel.name)}
            Icon={Edit}
            label="Edit Channel"
          />

          <ContextMenuItem
            action={() => {}}
            Icon={Copy}
            label="Duplicate Channel"
          />

          <ContextMenuSeparator />

          <ContextMenuItem
            action={() => openDelete(serverId, channel.id)}
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
