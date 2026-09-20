import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function useChannelReads() {
  const userId = pb.authStore.record?.id;

  return useQuery({
    queryKey: ["read_states"],
    queryFn: async () => {
      return await pb.collection("read_states").getFullList({
        filter: `user = "${userId}"`,
      });
    },
  });
}

export function useMarkChannelRead() {
  const queryClient = useQueryClient();
  const userId = pb.authStore.record?.id;

  return useMutation({
    mutationFn: async ({
      channelId,
      lastReadAt,
    }: {
      channelId: string;
      lastReadAt: string;
    }) => {
      try {
        const existing = await pb
          .collection("read_states")
          .getFirstListItem(`user = "${userId}" && channel = "${channelId}"`);

        return await pb
          .collection("read_states")
          .update(existing.id, { last_read_at: lastReadAt });
      } catch {
        return await pb.collection("read_states").create({
          user: userId,
          channel: channelId,
          last_read_at: lastReadAt,
        });
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["read_states"] }),
  });
}
