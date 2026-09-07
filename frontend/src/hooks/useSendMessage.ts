import { useMutation } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      channelId,
    }: {
      content: string;
      channelId: string;
    }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to send messages");

      return await pb.collection("messages").create({
        content,
        channel: channelId,
        user: userId,
      });
    },
  });
}
