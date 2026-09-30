import { pb } from "@/lib/pocketbase";
import type { Conversation } from "@/lib/types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      return await pb.collection("conversations").getFullList<Conversation>({
        sort: "-lastMessageAt",
        expand: "conversation_members_via_conversation.user",
      });
    },
  });

  useEffect(() => {
    const key = ["conversations"];
    const unsubPromise = pb
      .collection("messages")
      .subscribe<Conversation>("*", () => {
        queryClient.invalidateQueries({ queryKey: key });
      });

    unsubPromise.catch((err) =>
      console.warn("conversations subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [queryClient]);

  return query;
}
