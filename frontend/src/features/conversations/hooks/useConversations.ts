import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Conversation, DateTime } from "@/lib/types";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  isConversationHidden,
  isConversationUnread,
} from "../utils/conversation";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: queryKeys.conversations.list(),
    queryFn: () =>
      pb.collection("conversations").getFullList<Conversation>({
        sort: "-lastMessageAt",
        expand: "conversation_members_via_conversation.user",
      }),
  });
}

export function useUnreadConversations() {
  const userId = pb.authStore.record?.id;
  const { data: conversations } = useConversations();

  return (conversations || []).filter(
    (c) => !isConversationHidden(c, userId) && isConversationUnread(c, userId),
  );
}

export function useConversationsSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const key = queryKeys.conversations.list();

    const unsubPromise = pb
      .collection("conversations")
      .subscribe<Conversation>("*", (e) => {
        if (e.action === "create") {
          queryClient.invalidateQueries({
            queryKey: queryKeys.conversations.all(),
          });
          return;
        }

        queryClient.setQueryData<Conversation[]>(key, (old) => {
          if (!old) return old;
          switch (e.action) {
            case "update":
              return old
                .map((c) =>
                  c.id === e.record.id ? { ...e.record, expand: c.expand } : c,
                )
                .sort((a, b) =>
                  (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
                );
            case "delete":
              return old.filter((c) => c.id !== e.record.id);
            default:
              return old;
          }
        });
      });

    unsubPromise.catch((err) =>
      console.warn("conversations subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient]);
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      lastReadAt,
    }: {
      memberId: string;
      lastReadAt: DateTime;
    }) =>
      pb.collection("conversation_members").update(memberId, { lastReadAt }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      }),
  });
}

export function useHideConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      pb
        .collection("conversation_members")
        .update(memberId, { hiddenAt: new Date().toISOString() }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      }),
  });
}
