import { useMutation } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      channelId,
      file,
    }: {
      content: string;
      channelId: string;
      file?: File | null;
    }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to send messages");

      if (file) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("channel", channelId);
        formData.append("user", userId);
        formData.append("attachment", file);

        return await pb.collection("messages").create(formData);
      }

      return await pb.collection("messages").create({
        content,
        channel: channelId,
        user: userId,
      });
    },
  });
}
