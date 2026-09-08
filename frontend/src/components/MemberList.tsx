import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerMembers } from "../hooks/useServerMembers";
import { pb } from "../lib/pocketbase";
import { useCurrentMembership } from "../hooks/useCurrentMembership";
import { queryKeys } from "../lib/querykeys";
import { usePresence } from "../hooks/usePresence";
import type { ServerMember } from "../lib/types";
import { cn } from "cn";
import { useState } from "react";

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
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search members..."
        className="w-full rounded border border-zinc-200 px-2 py-1 text-sm outline-none focus:outline-none"
      />

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
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.record?.id;
  const isSelf = member.user === currentUserId;

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      membershipId,
      role,
    }: {
      membershipId: string;
      role: "admin" | "member";
    }) => {
      return await pb
        .collection("server_members")
        .update(membershipId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.list(serverId),
      });
    },
  });

  const banMemberMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      return await pb.collection("server_members").delete(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serverMembers.list(serverId),
      });
    },
  });

  const isPending = updateRoleMutation.isPending || banMemberMutation.isPending;

  return (
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
          "flex-1",
          isSelf && "font-semibold",
          member.role === "owner" && "text-teal-500",
          member.role === "admin" && "text-purple-500",
        )}
      >
        {member.expand?.user?.name || "Unknown User"}{" "}
        {isSelf && <span className="text-xs text-zinc-400">(You)</span>}
      </span>

      {member.role === "owner" && <span>👑</span>}

      {isOwner && !isSelf && (
        <div className="flex gap-2 text-xs">
          {member.role === "member" && (
            <button
              disabled={isPending}
              onClick={() =>
                updateRoleMutation.mutate({
                  membershipId: member.id,
                  role: "admin",
                })
              }
              className="text-blue-500 hover:underline disabled:opacity-50"
            >
              Promote
            </button>
          )}

          {member.role === "admin" && (
            <button
              disabled={isPending}
              onClick={() =>
                updateRoleMutation.mutate({
                  membershipId: member.id,
                  role: "member",
                })
              }
              className="text-yellow-600 hover:underline disabled:opacity-50"
            >
              Demote
            </button>
          )}

          {member.role !== "owner" && (
            <button
              disabled={isPending}
              onClick={() => banMemberMutation.mutate(member.id)}
              className="text-red-500 hover:underline disabled:opacity-50"
            >
              Ban
            </button>
          )}
        </div>
      )}
    </li>
  );
}
