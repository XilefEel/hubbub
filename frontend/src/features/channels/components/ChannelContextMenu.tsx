import { CheckCheck, Copy, Edit, Trash } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import type { Channel } from "@/lib/types";
import { useMarkChannelRead } from "../hooks/useReadStates";
import { fetchLastMessage } from "@/features/messages/hooks/useMessages";
import { useDeleteChannelModal } from "../modals/useDeleteChannelModal";
import { useEditChannelModal } from "../modals/useEditChannelModal";

export default function ChannelContextMenu({
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

  const markRead = useMarkChannelRead();

  const handleMarkRead = async () => {
    const last = await fetchLastMessage(channel.id);
    if (!last) return;
    markRead.mutate({ channelId: channel.id, lastReadAt: last.created });
  };

  return (
    <BaseContextMenu
      content={
        <>
          <ContextMenuItem
            action={() => openEdit(channel.id, channel.name)}
            Icon={Edit}
            label="Edit Channel"
            show={isOwner}
          />

          <ContextMenuItem
            action={() => {}}
            Icon={Copy}
            label="Duplicate Channel"
            show={isOwner}
          />

          <ContextMenuItem
            action={handleMarkRead}
            Icon={CheckCheck}
            label="Mark as Read"
          />

          <ContextMenuSeparator show={isOwner} />

          <ContextMenuItem
            action={() => openDelete(serverId, channel.id)}
            Icon={Trash}
            label="Delete Channel"
            isDelete
            show={isOwner}
          />
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
