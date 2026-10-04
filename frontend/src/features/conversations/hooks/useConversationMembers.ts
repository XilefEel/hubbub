import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { ConversationMember, DateTime } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  });
}

export function findPartner(
  members: ConversationMember[] | undefined,
  meId?: string,
) {
  return members?.map((m) => m.expand?.user).find((u) => u && u.id !== meId);
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      lastReadAt,
    }: {
      memberId: string;
      lastReadAt: DateTime;
    }) => {
      return await pb
        .collection("conversation_members")
        .update(memberId, { lastReadAt });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      }),
  });
}
