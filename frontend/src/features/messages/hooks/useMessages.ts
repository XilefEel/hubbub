import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Message } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useMutation } from "@tanstack/react-query";

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      channelId,
      files,
      replyTo,
      mentions,
    }: {
      content: string;
      channelId: string;
      files?: File[];
      replyTo?: string;
      mentions?: string[];
    }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to send messages");

      const formData = new FormData();
      formData.append("content", content);
      formData.append("channel", channelId);
      formData.append("user", userId);
      if (replyTo) formData.append("replyTo", replyTo);

      for (const file of files ?? []) {
        formData.append("attachments", file);
      }

      for (const mention of mentions ?? []) {
        formData.append("mentions", mention);
      }

      const message = await pb.collection("messages").create(formData);

      await pb.collection("channels").update(channelId, {
        lastMessageAt: message.created,
      });

      return message;
    },
  });
}

export function useEditMessage(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => await pb.collection("messages").update(messageId, { content }),
    onSuccess,
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: async (messageId: string) =>
      await pb.collection("messages").delete(messageId),
  });
}

export function useMessages(channelId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Message[]>({
    queryKey: queryKeys.messages.list(channelId),
    queryFn: async () => {
      return await pb.collection("messages").getFullList<Message>({
        filter: `channel = "${channelId}"`,
        sort: "created",
        expand: "user,replyTo,replyTo.user,mentions",
      });
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    const key = queryKeys.messages.list(channelId);
    const unsubPromise = pb.collection("messages").subscribe<Message>(
      "*",
      (e) => {
        queryClient.setQueryData<Message[]>(key, (old = []) => {
          switch (e.action) {
            case "create":
              return old.some((m) => m.id === e.record.id)
                ? old
                : [...old, e.record];
            case "update":
              return old.map((m) => (m.id === e.record.id ? e.record : m));
            case "delete":
              return old.filter((m) => m.id !== e.record.id);
            default:
              return old;
          }
        });
      },
      {
        filter: pb.filter("channel = {:id}", { id: channelId }),
        expand: "user,replyTo,replyTo.user,mentions",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("message subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [channelId, queryClient]);

  return query;
}
