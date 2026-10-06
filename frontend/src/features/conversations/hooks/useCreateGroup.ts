import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      name,
    }: {
      userIds: string[];
      name?: string;
    }) => {
      const res = await pb.send<{ conversationId: string }>("/api/dms/group", {
        method: "POST",
        body: { userIds, name },
      });
      return res.conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}
