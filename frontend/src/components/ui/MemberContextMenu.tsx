import { ArrowUpCircle, ArrowDownCircle, ShieldBan } from "lucide-react";
import {
  BaseContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "../ui/ContextMenu";
import type { ServerMember } from "../../lib/types";

export function MemberContextMenu({
  member,
  isOwner,
  isSelf,
  isPending,
  onPromote,
  onDemote,
  onBan,
  children,
}: {
  member: ServerMember;
  isOwner: boolean;
  isSelf: boolean;
  isPending?: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onBan: () => void;
  children: React.ReactNode;
}) {
  return (
    <BaseContextMenu
      disabled={isSelf || !isOwner}
      content={
        <>
          {member.role === "member" && (
            <ContextMenuItem
              action={onPromote}
              Icon={ArrowUpCircle}
              label="Promote to Admin"
              disabled={isPending}
            />
          )}

          {member.role === "admin" && (
            <ContextMenuItem
              action={onDemote}
              Icon={ArrowDownCircle}
              label="Demote to Member"
              disabled={isPending}
            />
          )}

          {member.role !== "owner" && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                action={onBan}
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
