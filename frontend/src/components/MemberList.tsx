import { useServerMembers } from "../hooks/useServerMembers";

export function MemberList({ serverId }: { serverId: string }) {
  const { data: members, isLoading, error } = useServerMembers(serverId);

  if (isLoading)
    return <p className="text-sm text-gray-500">Loading members...</p>;
  if (error)
    return <p className="text-sm text-red-500">Failed to load members</p>;

  console.log("Members:", members);

  return (
    <ul className="flex flex-col gap-1">
      {members?.map((m) => (
        <li key={m.id} className="flex justify-between text-sm">
          <span>{m.expand?.user?.name}</span>
          <span className="text-gray-400">{m.role}</span>
        </li>
      ))}
    </ul>
  );
}
