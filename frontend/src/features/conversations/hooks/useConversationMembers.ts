import { pb } from "@/lib/pocketbase";
import type { ConversationMember } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: ["conversationMembers", conversationId],
    queryFn: async () => {
      return await pb
        .collection("conversation_members")
        .getFullList<ConversationMember>({
          filter: pb.filter("conversation = {:id}", { id: conversationId }),
          expand: "user",
        });
    },
    enabled: !!conversationId,
  });
}

export function findPartner(
  members: ConversationMember[] | undefined,
  meId?: string,
) {
  return members?.map((m) => m.expand?.user).find((u) => u && u.id !== meId);
}
