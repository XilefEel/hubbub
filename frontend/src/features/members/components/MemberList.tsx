import { useMemo, useState } from "react";
import { PanelRight, Search } from "lucide-react";
// import { useCurrentMembership } from "../hooks/useCurrentMembership";
import { useOnlineUsers } from "../hooks/usePresence";
import { useServerMembers } from "../hooks/useServerMembers";
import MemberListItem from "./MemberListItem";
import Tooltip from "@/components/ui/Tooltip";
import { useUIActions } from "@/app/stores/useUIStore";
import Input from "@/components/ui/Input";
import MemberListSkeleton from "./MemberListSkeleton";

export default function MemberList({ serverId }: { serverId: string }) {
  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useServerMembers(serverId);
  // const { isOwner } = useCurrentMembership(serverId);
  const onlineUsers = useOnlineUsers();
  const { toggleMembers } = useUIActions();

  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = query.toLowerCase();
    return (members ?? []).filter((m) =>
      (m.expand?.user?.name ?? "").toLowerCase().includes(q),
    );
  }, [members, query]);

  const { onlineMembers, offlineMembers } = useMemo(() => {
    const onlineMembers = [];
    const offlineMembers = [];

    for (const member of filteredMembers) {
      if (onlineUsers[member.user]) {
        onlineMembers.push(member);
      } else {
        offlineMembers.push(member);
      }
    }

    return { onlineMembers, offlineMembers };
  }, [filteredMembers, onlineUsers]);

  return (
    <div className="flex flex-col gap-4 text-zinc-900 dark:text-zinc-100">
      <div className="relative flex items-center gap-4">
        <Tooltip content="Hide Members">
          <button
            onClick={toggleMembers}
            className="text-sm transition-colors duration-100 hover:text-teal-500"
          >
            <PanelRight className="size-4 shrink-0" />
          </button>
        </Tooltip>

        <Search className="absolute top-1/2 left-10 size-4 shrink-0 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />

        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members..."
          className="py-1 pr-2 pl-8"
        />
      </div>

      {isError ? (
        <p className="text-sm text-red-500">
          Failed to load channels: {error.message}
        </p>
      ) : isLoading ? (
        <MemberListSkeleton />
      ) : (
        <>
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
                    isOwner={true}
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
                    isOwner={true}
                    serverId={serverId}
                    isOnline={false}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
