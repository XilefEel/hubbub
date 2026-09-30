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

export function useConversationPartner(conversationId: string) {
  const me = pb.authStore.record?.id;
  const query = useConversationMembers(conversationId);

  const partner = query.data
    ?.map((m) => m.expand?.user)
    .find((u) => u && u.id !== me);

  return partner;
}
