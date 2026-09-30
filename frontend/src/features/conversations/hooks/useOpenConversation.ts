import { pb } from "@/lib/pocketbase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useOpenConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
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

  return { open: mutation.mutate, isPending: mutation.isPending };
}
