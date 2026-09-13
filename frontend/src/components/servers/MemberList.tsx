import { useState } from "react";
import { Search } from "lucide-react";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { usePresence } from "../../hooks/usePresence";
import { useServerMembers } from "../../hooks/useServerMembers";
import MemberListItem from "./MemberListItem";

export function MemberList({ serverId }: { serverId: string }) {
  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useServerMembers(serverId);
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

  if (isError)
    return (
      <p className="text-sm text-red-500">
        Failed to load members: {error.message}
      </p>
    );

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
