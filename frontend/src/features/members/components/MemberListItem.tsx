import { Crown } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import type { ServerMember } from "@/lib/types";
import { cn } from "cn";
import UserAvatar from "@/components/ui/UserAvatar";
import { MemberContextMenu } from "./MemberContextMenu";

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
          "flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50",
          !isOnline && "opacity-70 hover:opacity-100",
        )}
      >
        <UserAvatar user={member.expand?.user} size="size-8" />

        <span
          className={cn(
            isSelf && "font-semibold",
            member.role === "owner" && "text-teal-500",
            member.role === "admin" && "text-purple-500",
          )}
        >
          {member.expand?.user?.name || "Unknown User"}{" "}
        </span>

        {member.role === "owner" && (
          <Crown className="size-4 text-teal-500 dark:text-teal-400" />
        )}

        {isSelf && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            (You)
          </span>
        )}
      </li>
    </MemberContextMenu>
  );
}
