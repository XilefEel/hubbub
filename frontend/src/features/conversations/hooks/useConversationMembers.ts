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
  });
}

export function findPartner(
  members: ConversationMember[] | undefined,
  meId?: string,
) {
  return members?.map((m) => m.expand?.user).find((u) => u && u.id !== meId);
}

export function getOtherUsers(
  convo: Conversation,
  myId: string | undefined,
): User[] {
  const members = convo.expand?.conversation_members_via_conversation ?? [];

  return members.flatMap((m) => {
    const user = m.expand?.user;
    return user && user.id !== myId ? [user] : [];
  });
}

export function getConversationTitle(
  convo: Conversation,
  myId: string | undefined,
) {
  if (convo.name) return convo.name;

  const others = getOtherUsers(convo, myId);
  if (convo.isGroup) return others.map((u) => u.name).join(", ") || "Group";

  return others[0]?.name ?? "Unknown User";
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
