import { Copy, LogOut, Settings, Trash2 } from "lucide-react";
import { useDeleteServer, useLeaveServer } from "../../hooks/useServers";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";

export function ServerContextMenu({
  serverId,
  inviteCode,
  children,
}: {
  serverId: string;
  inviteCode: string;
  children: React.ReactNode;
}) {
  const leaveServer = useLeaveServer();
  const deleteServer = useDeleteServer();

  const { isOwner } = useCurrentMembership(serverId);

  const isPending = leaveServer.isPending || deleteServer.isPending;

  const handleCopyInvite = () => navigator.clipboard.writeText(inviteCode);

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
              action={() => {}}
              Icon={Settings}
              label="Server settings"
            />
          )}

          <ContextMenuSeparator />

          {isOwner ? (
            <ContextMenuItem
              action={() => deleteServer.mutate(serverId)}
              Icon={Trash2}
              label="Delete server"
              isDelete
              disabled={isPending}
            />
          ) : (
            <ContextMenuItem
              action={() => leaveServer.mutate(serverId)}
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
