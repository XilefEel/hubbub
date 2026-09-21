import { useEditServerModal } from "@/app/modals/useModalStore";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { useCurrentMembership } from "@/features/members/hooks/useCurrentMembership";
import type { Server } from "@/lib/types";
import { Copy, Settings, Trash2, LogOut } from "lucide-react";
import { useLeaveServer, useDeleteServer } from "../hooks/useServers";

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
