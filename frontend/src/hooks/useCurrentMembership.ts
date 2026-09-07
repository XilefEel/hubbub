import { pb } from "../lib/pocketbase";
import { useServerMembers } from "./useServerMembers";

export function useCurrentMembership(serverId: string) {
  const { data: members, isLoading } = useServerMembers(serverId);
  const currentUserId = pb.authStore.record?.id;
  const currentMember = members?.find((m) => m.user === currentUserId);

  return {
    role: currentMember?.role,
    isOwner: currentMember?.role === "owner",
    isAdmin: currentMember?.role === "admin",
    isLoading,
  };
}
