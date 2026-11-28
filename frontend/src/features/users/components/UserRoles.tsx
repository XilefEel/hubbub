import { useMemberRoles } from "../../members/hooks/useServerMembers";

export default function UserRoles({
  userId,
  serverId,
}: {
  userId: string;
  serverId: string;
}) {
  const roles = useMemberRoles(serverId, userId);

  if (roles.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1 text-zinc-600 dark:text-zinc-300">
      {roles.map((role) => (
        <span
          key={role.id}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-0.5 text-xs dark:border-zinc-700"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: role.color }}
          />
          {role.name}
        </span>
      ))}
    </div>
  );
}
