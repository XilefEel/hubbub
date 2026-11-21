import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
  ContextSubMenu,
} from "@/components/ui/ContextMenu";
import type { ServerMember } from "@/lib/types";
import { Shield } from "lucide-react";
import {
  useRemoveMemberRole,
  useUpdateMemberRole,
  useRoles,
} from "@/features/roles/hooks/useRoles";

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

  const handleToggleRole = (roleId: string) => {
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

  return (
    <ContextMenu
      disabled={isSelf || !isOwner}
      content={
        <>
          <ContextSubMenu Icon={Shield} label="Manage Role">
            {roles?.map((role) => (
              <ContextMenuCheckboxItem
                key={role.id}
                checked={member.roles.includes(role.id)}
                onToggle={() => handleToggleRole(role.id)}
              >
                @{role.name}
              </ContextMenuCheckboxItem>
            ))}
          </ContextSubMenu>

          <ContextMenuSeparator show={true} />

          {/*<ContextMenuItem
            action={handleBan}
            Icon={ShieldBan}
            label="Ban"
            isDelete
            show={true}
            disabled={isPending}
          />*/}
        </>
      }
    >
      {children}
    </ContextMenu>
  );
}
