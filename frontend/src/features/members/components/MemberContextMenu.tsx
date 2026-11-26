import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextSubMenu,
} from "@/components/ui/ContextMenu";
import type { ServerMember } from "@/lib/types";
import { Shield, ShieldBan, UserMinus } from "lucide-react";
import {
  useRemoveMemberRole,
  useUpdateMemberRole,
  useRoles,
} from "@/features/roles/hooks/useRoles";
import { useMyPerms, useMyRank } from "@/features/roles/hooks/usePermissions";

export default function MemberContextMenu({
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
  const { data: roles } = useRoles(serverId);
  const updateMemberRole = useUpdateMemberRole(serverId);
  const removeMemberRole = useRemoveMemberRole(serverId);

  const myPerms = useMyPerms(serverId);
  const myRank = useMyRank(serverId);

  const hasActions =
    myPerms.ManageRoles || myPerms.KickMembers || myPerms.BanMembers;

  const handleToggleRole = (roleId: string) => {
    if (!myPerms.ManageRoles) return;

    const hasRole = member.roles.includes(roleId);

    if (hasRole) {
      removeMemberRole.mutate({
        userId: member.user,
        roleId,
      });
    } else {
      updateMemberRole.mutate({
        userId: member.user,
        roleId,
      });
    }
  };

  // TODO: Add kick and ban functionality
  // const handleKickMember = () => {...}
  // const handleBanMember = () => {...}

  return (
    <ContextMenu
      disabled={isSelf || isOwner || !hasActions}
      content={
        <>
          <ContextSubMenu
            Icon={Shield}
            label="Manage Role"
            show={myPerms.ManageRoles}
          >
            {roles?.map((role) => (
              <ContextMenuCheckboxItem
                key={role.id}
                checked={member.roles.includes(role.id)}
                onToggle={() => handleToggleRole(role.id)}
                disabled={role.position <= myRank}
              >
                @{role.name}
              </ContextMenuCheckboxItem>
            ))}
          </ContextSubMenu>

          <ContextMenuSeparator
            show={
              myPerms.ManageRoles && (myPerms.KickMembers || myPerms.BanMembers)
            }
          />

          <ContextMenuItem
            action={() => {}}
            Icon={UserMinus}
            label="Kick"
            show={myPerms.KickMembers}
          />

          <ContextMenuItem
            action={() => {}}
            Icon={ShieldBan}
            label="Ban"
            isDelete
            show={myPerms.BanMembers}
          />
        </>
      }
    >
      {children}
    </ContextMenu>
  );
}
