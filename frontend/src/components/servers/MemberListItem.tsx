import { Crown } from "lucide-react";
import { pb } from "../../lib/pocketbase";
import type { ServerMember } from "../../lib/types";
import { MemberContextMenu } from "../context-menus/MemberContextMenu";
import { cn } from "cn";

export default function MemberListItem({
  member,
  isOwner,
  serverId,
  isOnline,
}: {
  member: ServerMember;
  isOwner: boolean;
  serverId: string;
  isOnline: boolean;
}) {
  const currentUserId = pb.authStore.record?.id;
  const isSelf = member.user === currentUserId;

  return (
    <MemberContextMenu
      member={member}
      serverId={serverId}
      isOwner={isOwner}
      isSelf={isSelf}
    >
      <li
        className={cn(
          "flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-zinc-50",
          !isOnline && "opacity-70 hover:opacity-100",
        )}
      >
        <div
          className={cn(
            "size-6 rounded-full bg-teal-100",
            !isOnline && "bg-zinc-100",
          )}
        />

        <span
          className={cn(
            isSelf && "font-semibold",
            member.role === "owner" && "text-teal-500",
            member.role === "admin" && "text-purple-500",
          )}
        >
          {member.expand?.user?.name || "Unknown User"}{" "}
        </span>

        {member.role === "owner" && <Crown className="size-4 text-teal-500" />}

        {isSelf && <span className="text-xs text-zinc-400">(You)</span>}
      </li>
    </MemberContextMenu>
  );
}
