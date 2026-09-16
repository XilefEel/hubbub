import { Copy, LogOut, Settings, Trash2 } from "lucide-react";
import { useDeleteServer, useLeaveServer } from "../../hooks/useServers";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { useEditServerModal } from "../../stores/useModalStore";
import type { Server } from "../../lib/types";

export function ServerContextMenu({
  server,
  children,
}: {
  server: Server;
  children: React.ReactNode;
}) {
  const { openModal } = useEditServerModal();

  const leaveServer = useLeaveServer();
  const deleteServer = useDeleteServer();

  const { isOwner } = useCurrentMembership(server.id);

  const isPending = leaveServer.isPending || deleteServer.isPending;

  const handleCopyInvite = () =>
    navigator.clipboard.writeText(server.inviteCode);

  return (
    <BaseContextMenu
      content={
        <>
          <ContextMenuItem
            action={handleCopyInvite}
            Icon={Copy}
            label="Copy invite code"
          />

          {isOwner && (
            <ContextMenuItem
              action={() => openModal(server)}
              Icon={Settings}
              label="Server settings"
            />
          )}

          <ContextMenuSeparator />

          {isOwner ? (
            <ContextMenuItem
              action={() => deleteServer.mutate(server.id)}
              Icon={Trash2}
              label="Delete server"
              isDelete
              disabled={isPending}
            />
          ) : (
            <ContextMenuItem
              action={() => leaveServer.mutate(server.id)}
              Icon={LogOut}
              label="Leave server"
              isDelete
              disabled={isPending}
            />
          )}
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
