import { useQueryClient } from "@tanstack/react-query";
import { useServerMembers } from "../hooks/useServerMembers";
import { pb } from "../lib/pocketbase";

export function MemberList({ serverId }: { serverId: string }) {
  const { data: members, isLoading, error } = useServerMembers(serverId);
  const queryClient = useQueryClient();

  const currentUserId = pb.authStore.record?.id;
  const currentMember = members?.find((m) => m.user === currentUserId);
  const isOwner = currentMember?.role === "owner";

  const handlePromote = async (membershipId: string) => {
    if (!isOwner) return;

    try {
      await pb
        .collection("server_members")
        .update(membershipId, { role: "admin" });

      queryClient.invalidateQueries({ queryKey: ["server_members", serverId] });
    } catch (err) {
      console.error("Failed to promote member:", err);
    }
  };

  const handleDemote = async (membershipId: string) => {
    if (!isOwner) return;

    try {
      await pb
        .collection("server_members")
        .update(membershipId, { role: "member" });

      queryClient.invalidateQueries({ queryKey: ["server_members", serverId] });
    } catch (err) {
      console.error("Failed to demote member:", err);
    }
  };

  const handleBan = async (membershipId: string) => {
    if (!isOwner) return;

    try {
      await pb.collection("server_members").delete(membershipId);
      queryClient.invalidateQueries({ queryKey: ["server_members", serverId] });
    } catch (err) {
      console.error("Failed to ban member:", err);
    }
  };

  if (isLoading)
    return <p className="text-sm text-gray-500">Loading members...</p>;

  if (error)
    return <p className="text-sm text-red-500">Failed to load members</p>;

  return (
    <ul className="flex flex-col gap-1">
      {members?.map((m) => (
        <li key={m.id} className="flex gap-3 border-b text-sm">
          <p>
            {m.expand?.user?.name} {m.user === currentUserId && "(You)"}
          </p>
          <p className="mr-auto text-gray-400">{m.role}</p>

          {isOwner && m.role === "member" && (
            <button
              onClick={() => handlePromote(m.id)}
              className="text-blue-500 hover:underline"
            >
              Promote to Admin
            </button>
          )}

          {isOwner && m.role === "admin" && (
            <button
              onClick={() => handleDemote(m.id)}
              className="text-yellow-500 hover:underline"
            >
              Demote to Member
            </button>
          )}

          {isOwner && m.role !== "owner" && (
            <button
              onClick={() => handleBan(m.id)}
              className="text-red-500 hover:underline"
            >
              Ban
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
