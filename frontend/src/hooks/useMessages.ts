import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Message } from "../lib/types";
import { queryKeys } from "../lib/querykeys";
import { useMutation } from "@tanstack/react-query";

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      channelId,
      files,
      replyTo,
    }: {
      content: string;
      channelId: string;
      files?: File[];
      replyTo?: string;
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

      return await pb.collection("messages").create(formData);
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
  const queryKey = queryKeys.messages.list(channelId);

  const query = useQuery<Message[]>({
    queryKey,
    queryFn: async () => {
      return await pb.collection("messages").getFullList<Message>({
        filter: `channel = "${channelId}"`,
        sort: "created",
        expand: "user,replyTo,replyTo.user",
      });
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    // Subscribe to real-time updates for messages in the specified channel
    pb.collection("messages")
      .subscribe<Message>(
        "*",
        (e) => {
          if (e.action === "create") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
              if (old.some((msg) => msg.id === e.record.id)) return old;
              return [...old, e.record];
            });
          }

          if (e.action === "update") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.map((msg) => (msg.id === e.record.id ? e.record : msg)),
            );
          }

          if (e.action === "delete") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.filter((msg) => msg.id !== e.record.id),
            );
          }
        },
        {
          filter: `channel = "${channelId}"`,
          expand: "user,replyTo,replyTo.user",
        },
      )
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("message subscription failed:", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, queryClient]);

  return query;
}
