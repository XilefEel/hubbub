import { ArrowUpCircle, ArrowDownCircle, ShieldBan } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import type { ServerMember } from "../../lib/types";
import {
  useUpdateMemberRole,
  useBanMember,
} from "../../hooks/useServerMembers";

export function MemberContextMenu({
  member,
  serverId,
  isOwner,
  isSelf,
  children,
}: {
  member: ServerMember;
  serverId: string;
  isOwner: boolean;
  isSelf: boolean;
  children: React.ReactNode;
}) {
  const updateRoleMutation = useUpdateMemberRole(serverId);
  const banMemberMutation = useBanMember(serverId);

  const isPending = updateRoleMutation.isPending || banMemberMutation.isPending;

  const handlePromote = () =>
    updateRoleMutation.mutate({ membershipId: member.id, role: "admin" });

  const handleDemote = () =>
    updateRoleMutation.mutate({ membershipId: member.id, role: "member" });

  const handleBan = () => banMemberMutation.mutate(member.id);

  return (
    <BaseContextMenu
      disabled={isSelf || !isOwner}
      content={
        <>
          {member.role === "member" && (
            <ContextMenuItem
              action={handlePromote}
              Icon={ArrowUpCircle}
              label="Promote to Admin"
              disabled={isPending}
            />
          )}

          {member.role === "admin" && (
            <ContextMenuItem
              action={handleDemote}
              Icon={ArrowDownCircle}
              label="Demote to Member"
              disabled={isPending}
            />
          )}

          {member.role !== "owner" && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                action={handleBan}
                Icon={ShieldBan}
                label="Ban"
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
