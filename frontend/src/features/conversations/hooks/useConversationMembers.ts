import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type {
  Conversation,
  ConversationMember,
  DateTime,
  User,
} from "@/lib/types";
import { isAfter } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

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

export function isConversationHidden(
  conversation: Conversation,
  userId?: string,
) {
  const me = conversation.expand?.conversation_members_via_conversation?.find(
    (m) => m.user === userId,
  );
  if (!me?.hiddenAt) return false;
  if (!conversation.lastMessageAt) return true;
  return !isAfter(conversation.lastMessageAt, me.hiddenAt);
}

export function useHideConversation() {
  const navigate = useNavigate();
  const { conversationId } = useParams({ strict: false });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId }: { memberId: string; conversationId: string }) =>
      pb
        .collection("conversation_members")
        .update(memberId, { hiddenAt: new Date().toISOString() }),

    onSuccess: async (_data, args) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });

      if (conversationId === args.conversationId) {
        navigate({ to: "/me" });
      }
    },
  });
}
