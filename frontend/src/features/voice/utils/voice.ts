import { pb } from "@/lib/pocketbase";
import type { VoiceParticipant } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useVoiceParticipantsQuery<T = VoiceParticipant[]>({
  queryKey,
  filter,
  enabled = true,
  select,
}: {
  queryKey: readonly string[];
  filter: string;
  enabled?: boolean;
  select?: (rows: VoiceParticipant[]) => T;
}) {
  return useQuery<VoiceParticipant[], Error, T>({
    queryKey,
    queryFn: () =>
      pb
        .collection("voice_participants")
        .getFullList<VoiceParticipant>({ filter, expand: "user" }),
    select,
    enabled,
  });
}

export function useVoiceParticipantsSync({
  queryKey,
  filter,
  enabled = true,
}: {
  queryKey: readonly string[];
  filter: string;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const unsubPromise = pb
      .collection("voice_participants")
      .subscribe<VoiceParticipant>(
        "*",
        (e) =>
          queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old) => {
            if (!old) return old;
            switch (e.action) {
              case "create":
                return old.some((vp) => vp.id === e.record.id)
                  ? old
                  : [...old, e.record];
              case "update":
                return old.map((vp) => (vp.id === e.record.id ? e.record : vp));
              case "delete":
                return old.filter((vp) => vp.id !== e.record.id);
              default:
                return old;
            }
          }),
        { filter, expand: "user" },
      );

    unsubPromise.catch((err) =>
      console.warn("voice participants subscription failed:", err),
    );

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, enabled, queryClient]);
}

export function groupBy(
  rows: VoiceParticipant[],
  field: "channel" | "conversation",
) {
  const map = new Map<string, VoiceParticipant[]>();

  for (const r of rows) {
    const key = r[field];
    if (!key) continue;

    const list = map.get(key);
    if (list) {
      list.push(r);
    } else {
      map.set(key, [r]);
    }
  }

  return map;
}

export const selectByChannel = (rows: VoiceParticipant[]) =>
  groupBy(rows, "channel");

export const selectByConversation = (rows: VoiceParticipant[]) =>
  groupBy(rows, "conversation");
