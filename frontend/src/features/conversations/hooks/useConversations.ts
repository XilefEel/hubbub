import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Conversation, DateTime } from "@/lib/types";
import {
  useQueryClient,
  useQuery,
  useMutation,
  queryOptions,
} from "@tanstack/react-query";
import { useEffect } from "react";
import {
  isConversationHidden,
  isConversationUnread,
} from "../utils/conversation";
import { Collections } from "@/lib/collections";

export const conversationsOptions = () =>
  queryOptions({
    queryKey: queryKeys.conversations.list(),
    queryFn: () =>
      pb.collection(Collections.Conversations).getFullList({
        sort: "-lastMessageAt",
        expand: "conversation_members_via_conversation.user",
      }),
    staleTime: 30_000,
  });

export function useConversations() {
  return useQuery(conversationsOptions());
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
  const userId = pb.authStore.record?.id;

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.conversations.list();

    const unsubPromise = pb
      .collection(Collections.Conversations)
      .subscribe("*", (e) => {
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
  }, [queryClient, userId]);
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
      pb
        .collection(Collections.ConversationMembers)
        .update(memberId, { lastReadAt }),
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
        .collection(Collections.ConversationMembers)
        .update(memberId, { hiddenAt: new Date().toISOString() }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      }),
  });
}
