import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import type { Server } from "@/lib/types";
import { Copy, Settings, Trash2, LogOut } from "lucide-react";
import { useLeaveServer, useDeleteServer } from "../hooks/useServers";
import { useServerModal } from "../modals/useServerModal";
import { useMyPerms } from "@/features/roles/hooks/usePermissions";
import { pb } from "@/lib/pocketbase";

export default function ServerContextMenu({
  server,
  children,
}: {
  server: Server;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu content={<ServerMenuItems server={server} />}>
      {children}
    </ContextMenu>
  );
}

function ServerMenuItems({ server }: { server: Server }) {
  const { openEdit } = useServerModal();
  const leaveServer = useLeaveServer();
  const deleteServer = useDeleteServer();

  const myPerms = useMyPerms(server.id);
  const isOwner = server.owner === pb.authStore.record?.id;

  const isPending = leaveServer.isPending || deleteServer.isPending;

  const handleCopyInvite = () =>
    navigator.clipboard.writeText(server.inviteCode);

  return (
    <>
      <ContextMenuItem
        action={handleCopyInvite}
        Icon={Copy}
        label="Copy invite code"
      />

      <ContextMenuItem
        action={() => openEdit(server)}
        Icon={Settings}
        label="Server settings"
        show={myPerms.ManageServer}
      />

      <ContextMenuSeparator
        show={myPerms.ManageServer || isOwner || !isOwner}
      />

      <ContextMenuItem
        action={() => deleteServer.mutate(server.id)}
        Icon={Trash2}
        label="Delete server"
        isDelete
        show={isOwner}
        disabled={isPending}
      />

      <ContextMenuItem
        action={() => leaveServer.mutate(server.id)}
        Icon={LogOut}
        label="Leave server"
        isDelete
        show={!isOwner}
        disabled={isPending}
      />
    </>
  );
}
