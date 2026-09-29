import { pb } from "@/lib/pocketbase";
import type { ConversationMember } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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

  return { ...query, partner };
}

export function useOpenConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const res = await pb.send<{ conversationId: string }>("/api/dms/open", {
        method: "POST",
        body: { userId: otherUserId },
      });
      return res.conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate({
        to: "/me/conversations/$conversationId",
        params: { conversationId },
      });
    },
  });
}
