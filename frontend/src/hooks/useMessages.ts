import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import type { Message } from "../lib/types";
import { queryKeys } from "../lib/querykeys";

export function useMessages(channelId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.messages.list(channelId);

  const query = useQuery<Message[]>({
    queryKey,
    queryFn: async () => {
      return await pb.collection("messages").getFullList<Message>({
        filter: `channel = "${channelId}"`,
        sort: "created",
        expand: "user",
      });
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    let unsubscribe: () => void;

    const subscribeToMessages = async () => {
      unsubscribe = await pb
        .collection("messages")
        .subscribe<Message>("*", async (e) => {
          if (e.record.channel !== channelId) return;

          if (e.action === "create") {
            // fetch the expanded record to include the user data
            const expandedRecord = await pb
              .collection("messages")
              .getOne<Message>(e.record.id, {
                expand: "user",
                requestKey: null,
              });

            queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
              if (old.some((msg) => msg.id === expandedRecord.id)) {
                return old;
              }
              return [...old, expandedRecord];
            });
          }

          if (e.action === "update") {
            const expandedRecord = await pb
              .collection("messages")
              .getOne<Message>(e.record.id, {
                expand: "user",
                requestKey: null,
              });

            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.map((msg) =>
                msg.id === expandedRecord.id ? expandedRecord : msg,
              ),
            );
          }

          if (e.action === "delete") {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
              old.filter((msg) => msg.id !== e.record.id),
            );
          }
        });
    };

    subscribeToMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, queryClient]);

  return query;
}
