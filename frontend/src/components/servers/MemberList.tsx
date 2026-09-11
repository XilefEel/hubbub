import { cn } from "cn";
import { useState } from "react";
import { Crown, Search } from "lucide-react";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { usePresence } from "../../hooks/usePresence";
import {
  useServerMembers,
  useUpdateMemberRole,
  useBanMember,
} from "../../hooks/useServerMembers";
import { pb } from "../../lib/pocketbase";
import type { ServerMember } from "../../lib/types";
import { MemberContextMenu } from "../ui/MemberContextMenu";

export function MemberList({ serverId }: { serverId: string }) {
  const { data: members, isLoading, error } = useServerMembers(serverId);
  const { isOwner } = useCurrentMembership(serverId);
  const { onlineUserIds } = usePresence();

  const [query, setQuery] = useState("");

  const filteredMembers =
    members?.filter((m) => {
      const name = m.expand?.user?.name || "";
      return name.toLowerCase().includes(query.toLowerCase());
    }) || [];

  const onlineMembers =
    filteredMembers?.filter((m) => onlineUserIds.includes(m.user)) || [];

  const offlineMembers =
    filteredMembers?.filter((m) => !onlineUserIds.includes(m.user)) || [];

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading members...</p>;

  if (error)
    return <p className="text-sm text-red-500">Failed to load members</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-2 size-4 shrink-0 -translate-y-1/2 text-zinc-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members..."
          className="w-full rounded border border-zinc-200 py-1 pr-2 pl-8 text-sm outline-none focus:outline-none"
        />
      </div>

      {query && filteredMembers.length === 0 && (
        <p className="text-xs text-zinc-400">No members match "{query}"</p>
      )}

      {onlineMembers.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold text-zinc-400 uppercase">
            Online — {onlineMembers.length}
          </h3>
          <ul className="flex flex-col gap-1">
            {onlineMembers.map((m) => (
              <MemberListItem
                key={m.id}
                member={m}
                isOwner={isOwner}
                serverId={serverId}
                isOnline={true}
              />
            ))}
          </ul>
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold text-zinc-400 uppercase">
            Offline — {offlineMembers.length}
          </h3>
          <ul className="flex flex-col gap-1">
            {offlineMembers.map((m) => (
              <MemberListItem
                key={m.id}
                member={m}
                isOwner={isOwner}
                serverId={serverId}
                isOnline={false}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MemberListItem({
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

  const updateRoleMutation = useUpdateMemberRole(serverId);
  const banMemberMutation = useBanMember(serverId);

  const isPending = updateRoleMutation.isPending || banMemberMutation.isPending;

  const handlePromote = () =>
    updateRoleMutation.mutate({ membershipId: member.id, role: "admin" });

  const handleDemote = () =>
    updateRoleMutation.mutate({ membershipId: member.id, role: "member" });

  const handleBan = () => banMemberMutation.mutate(member.id);

  return (
    <MemberContextMenu
      member={member}
      isOwner={isOwner}
      isSelf={isSelf}
      isPending={isPending}
      onPromote={handlePromote}
      onDemote={handleDemote}
      onBan={handleBan}
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
