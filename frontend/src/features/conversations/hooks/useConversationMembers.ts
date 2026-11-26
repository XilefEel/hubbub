import { Collections } from "@/lib/collections";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { useQuery } from "@tanstack/react-query";

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversationMembers.byConversation(conversationId),
    queryFn: () =>
      pb.collection(Collections.ConversationMembers).getFullList({
        filter: pb.filter("conversation = {:id}", { id: conversationId }),
        expand: "user",
      }),
    enabled: !!conversationId,
  });
}
