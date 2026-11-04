import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { ConversationMember } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversationMembers.list(conversationId),
    queryFn: async () => {
      return await pb
        .collection("conversation_members")
        .getFullList<ConversationMember>({
          filter: pb.filter("conversation = {:id}", { id: conversationId }),
          expand: "user",
        });
    },
    enabled: !!conversationId,
    staleTime: 1000 * 15, // 15 seconds
  });
}
