import { pb } from "@/lib/pocketbase";
import { useQuery } from "@tanstack/react-query";

function useMyMemberships() {
  const userId = pb.authStore.record?.id;

  return useQuery({
    queryKey: ["my-memberships", userId],
    queryFn: async () => {
      return await pb.collection("server_members").getFullList({
        filter: pb.filter("user = {:id}", { id: userId }),
      });
    },
    enabled: !!userId,
  });
}

export function useCurrentMembership(serverId: string) {
  const { data: memberships, isLoading } = useMyMemberships();
  const currentMember = memberships?.find((m) => m.server === serverId);

  return {
    role: currentMember?.role,
    isOwner: currentMember?.role === "owner",
    isAdmin: currentMember?.role === "admin",
    isLoading,
  };
}
