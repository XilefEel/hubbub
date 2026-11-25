import { CheckCheck, Copy, Edit, Trash } from "lucide-react";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import type { Channel } from "@/lib/types";
import { useMarkChannelRead } from "../hooks/useReadStates";
import { fetchLastMessage } from "@/features/messages/hooks/useMessages";
import { useDeleteChannelModal } from "../modals/useDeleteChannelModal";
import { useEditChannelModal } from "../modals/useEditChannelModal";
import { useMyPerms } from "@/features/roles/hooks/usePermissions";

export default function ChannelContextMenu({
  channel,
  children,
}: {
  channel: Channel;
  children: React.ReactNode;
}) {
  const { openModal: openEdit } = useEditChannelModal();
  const { openModal: openDelete } = useDeleteChannelModal();

  const markRead = useMarkChannelRead();

  const myPerms = useMyPerms(channel.server);

  const handleMarkRead = async () => {
    const last = await fetchLastMessage(channel.id);
    if (!last) return;
    markRead.mutate({ channelId: channel.id, lastReadAt: last.created });
  };

  return (
    <ContextMenu
      content={
        <>
          <ContextMenuItem
            action={() => openEdit(channel.id, channel.name)}
            Icon={Edit}
            label="Edit Channel"
            show={myPerms.ManageChannels}
          />

          <ContextMenuItem
            action={() => {}}
            Icon={Copy}
            label="Duplicate Channel"
            show={myPerms.ManageChannels}
          />

          <ContextMenuItem
            action={handleMarkRead}
            Icon={CheckCheck}
            label="Mark as Read"
          />

          <ContextMenuSeparator show={myPerms.ManageChannels} />

          <ContextMenuItem
            action={() => openDelete(channel.id)}
            Icon={Trash}
            label="Delete Channel"
            isDelete
            show={myPerms.ManageChannels}
          />
        </>
      }
    >
      {children}
    </ContextMenu>
  );
}
