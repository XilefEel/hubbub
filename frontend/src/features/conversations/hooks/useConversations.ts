import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Conversation } from "@/lib/types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: queryKeys.conversations.list(),
    queryFn: async () => {
      return await pb.collection("conversations").getFullList<Conversation>({
        sort: "-lastMessageAt",
        expand: "conversation_members_via_conversation.user",
      });
    },
  });
}

export function useConversationSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const key = queryKeys.conversations.list();
    const unsubPromise = pb
      .collection("conversations")
      .subscribe<Conversation>("*", (e) => {
        if (e.action === "create") {
          queryClient.invalidateQueries({ queryKey: key });
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
