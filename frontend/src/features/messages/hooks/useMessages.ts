import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Message, MessageScope } from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { useMutation } from "@tanstack/react-query";

const PAGE_SIZE = 50;

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      scope,
      files,
      replyTo,
      mentions,
    }: {
      content: string;
      scope: MessageScope;
      files?: File[];
      replyTo?: string;
      mentions?: string[];
    }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to send messages");

      const formData = new FormData();
      formData.append("content", content);
      formData.append(scope.type, scope.id);
      formData.append("user", userId);
      if (replyTo) formData.append("replyTo", replyTo);

      for (const file of files ?? []) {
        formData.append("attachments", file);
      }

      for (const mention of mentions ?? []) {
        formData.append("mentions", mention);
      }

      return await pb.collection<Message>("messages").create(formData);
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
    }) => {
      return await pb.collection("messages").update(messageId, { content });
    },
    onSuccess,
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: async (messageId: string) => {
      return await pb.collection("messages").delete(messageId);
    },
  });
}

export function useMessages(scope: MessageScope) {
  const queryClient = useQueryClient();
  const { type, id } = scope;

  const query = useInfiniteQuery({
    queryKey: queryKeys.messages.list(type, id),
    queryFn: async ({ pageParam }) => {
      const filter = pageParam
        ? pb.filter(`${type} = {:id} && created < {:cursor}`, {
            id,
            cursor: pageParam,
          })
        : pb.filter(`${type} = {:id}`, { id });

      const res = await pb
        .collection("messages")
        .getList<Message>(1, PAGE_SIZE, {
          filter,
          sort: "-created",
          expand: "user,replyTo,replyTo.user,mentions",
          skipTotal: true,
        });

      return {
        items: res.items,
        nextCursor:
          res.items.length === PAGE_SIZE
            ? res.items.at(-1)?.created
            : undefined,
      };
    },
    enabled: !!id,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  });

  useEffect(() => {
    if (!id) return;

    const key = queryKeys.messages.list(type, id);
    const unsubPromise = pb.collection("messages").subscribe<Message>(
      "*",
      (e) => {
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor?: string }>
        >(key, (old) => {
          if (!old) return old;

          switch (e.action) {
            case "create": {
              const exists = old.pages.some((p) =>
                p.items.some((m) => m.id === e.record.id),
              );
              if (exists) return old;
              const [first, ...rest] = old.pages;
              return {
                ...old,
                pages: [
                  { ...first, items: [e.record, ...first.items] },
                  ...rest,
                ],
              };
            }
            case "update":
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((m) =>
                    m.id === e.record.id ? e.record : m,
                  ),
                })),
              };
            case "delete":
              return {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.filter((m) => m.id !== e.record.id),
                })),
              };
            default:
              return old;
          }
        });
      },
      {
        filter: pb.filter(`${type} = {:id}`, { id }),
        expand: "user,replyTo,replyTo.user,mentions",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("message subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});

      queryClient.setQueryData<
        InfiniteData<{ items: Message[]; nextCursor?: string }>
      >(key, (old) =>
        old
          ? {
              pages: old.pages.slice(0, 1),
              pageParams: old.pageParams.slice(0, 1),
            }
          : old,
      );
    };
  }, [type, id, queryClient]);

  const messages = useMemo(
    () =>
      query.data
        ? [...query.data.pages].reverse().flatMap((p) => [...p.items].reverse())
        : [],
    [query.data],
  );

  return { ...query, data: messages };
}

export async function fetchLastMessage(channelId: string) {
  const res = await pb.collection("messages").getList<Message>(1, 1, {
    filter: pb.filter("channel = {:id}", { id: channelId }),
    sort: "-created",
    skipTotal: true,
  });

  return res.items[0] ?? null;
}
