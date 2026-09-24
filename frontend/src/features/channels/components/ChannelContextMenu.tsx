import { CheckCheck, Copy, Edit, Trash } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import type { Channel } from "@/lib/types";
import {
  useEditChannelModal,
  useDeleteChannelModal,
} from "@/app/modals/useModalStore";
import { useMarkChannelRead } from "../hooks/useReadStates";
import { fetchLastMessage } from "@/features/messages/hooks/useMessages";

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
          {isOwner && (
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
            </>
          )}

          <ContextMenuItem
            action={handleMarkRead}
            Icon={CheckCheck}
            label="Mark as Read"
          />

          {isOwner && (
            <>
              <ContextMenuSeparator />

              <ContextMenuItem
                action={() => openDelete(serverId, channel.id)}
                Icon={Trash}
                label="Delete Channel"
                isDelete
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
