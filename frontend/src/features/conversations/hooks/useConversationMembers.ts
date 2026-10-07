import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type {
  Conversation,
  ConversationMember,
  DateTime,
  User,
} from "@/lib/types";
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
    staleTime: 1000 * 15, // 15 seconds
  });
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

export function getOtherUsers(
  conversation: Conversation,
  myId: string | undefined,
): User[] {
  const members =
    conversation.expand?.conversation_members_via_conversation ?? [];

  return members.flatMap((m) => {
    const user = m.expand?.user;
    return user && user.id !== myId ? [user] : [];
  });
}

export function getConversationTitle(
  conversation: Conversation,
  myId: string | undefined,
) {
  if (conversation.name) return conversation.name;

  const others = getOtherUsers(conversation, myId);
  if (conversation.isGroup)
    return others.map((u) => u.name).join(", ") || "Group";

  return others[0]?.name ?? "Unknown User";
}
