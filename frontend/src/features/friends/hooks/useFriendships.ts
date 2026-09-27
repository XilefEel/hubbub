import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Friendship } from "@/lib/types";

export function useFriendships(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<Friendship[]>({
    queryKey: queryKeys.friendships.list(userId ?? ""),
    queryFn: async () => {
      return await pb.collection("friendships").getFullList<Friendship>({
        filter: pb.filter("requester = {:id} || addressee = {:id}", {
          id: userId,
        }),
        sort: "-created",
        expand: "requester,addressee",
      });
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const key = queryKeys.friendships.list(userId);
    const unsubPromise = pb.collection("friendships").subscribe<Friendship>(
      "*",
      (e) => {
        queryClient.setQueryData<Friendship[]>(key, (old = []) => {
          switch (e.action) {
            case "create":
              return old.some((f) => f.id === e.record.id)
                ? old
                : [...old, e.record];
            case "update":
              return old.map((f) => (f.id === e.record.id ? e.record : f));
            case "delete":
              return old.filter((f) => f.id !== e.record.id);
            default:
              return old;
          }
        });
      },
      {
        filter: pb.filter("requester = {:id} || addressee = {:id}", {
          id: userId,
        }),
        expand: "requester,addressee",
      },
    );

    unsubPromise.catch((err) =>
      console.warn("friendship subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [userId, queryClient]);

  return query;
}
