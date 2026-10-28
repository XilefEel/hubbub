import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { VoiceScope, VoiceParticipant } from "@/lib/types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useVoiceParticipants({ type, id }: VoiceScope) {
  return useVoiceParticipantsQuery({
    queryKey: queryKeys.voiceParticipants.list(type, id),
    filter: pb.filter(`${type} = {:id}`, { id }),
    enabled: !!id,
  });
}

export function useServerActiveCalls(serverId: string) {
  return useVoiceParticipantsQuery({
    queryKey: queryKeys.voiceParticipants.byServer(serverId),
    filter: pb.filter("channel.server = {:id}", { id: serverId }),
    enabled: !!serverId,
    select: selectByChannel,
  });
}

export function useDmActiveCalls() {
  const userId = pb.authStore.record?.id ?? "";

  return useVoiceParticipantsQuery({
    queryKey: queryKeys.voiceParticipants.dmCalls(),
    filter: pb.filter(
      "conversation.conversation_members_via_conversation.user ?= {:me}",
      { me: userId },
    ),
    enabled: !!userId,
    select: selectByConversation,
  });
}

function useVoiceParticipantsQuery<T = VoiceParticipant[]>({
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
  const queryClient = useQueryClient();

  const query = useQuery<VoiceParticipant[], Error, T>({
    queryKey,
    queryFn: () =>
      pb
        .collection("voice_participants")
        .getFullList<VoiceParticipant>({ filter, expand: "user" }),
    select,
    enabled,
  });

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

  return query;
}

function groupBy(rows: VoiceParticipant[], field: "channel" | "conversation") {
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

const selectByChannel = (rows: VoiceParticipant[]) => groupBy(rows, "channel");

const selectByConversation = (rows: VoiceParticipant[]) =>
  groupBy(rows, "conversation");
