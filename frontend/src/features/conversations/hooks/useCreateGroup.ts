import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useCreateGroup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const res = await pb.send<{ conversationId: string }>("/api/dms/group", {
        method: "POST",
        body: { userIds },
      });
      return res.conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
      navigate({
        to: "/me/conversations/$conversationId",
        params: { conversationId },
      });
    },
  });
}
