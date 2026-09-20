import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Room } from "livekit-client";
import { pb } from "../lib/pocketbase";
import type { VoiceParticipant, VoiceTokenResponse } from "../lib/types";
import {
  useVoiceActions,
  useVoiceChannelStore,
} from "../stores/useVoiceChannelStore";
import { useEffect } from "react";
import { queryKeys } from "../lib/querykeys";
import { isUniqueConstraintError } from "../lib/utils";

async function getVoiceToken(channelId: string): Promise<VoiceTokenResponse> {
  return pb.send("/api/voice/token", {
    method: "POST",
    body: { channelId },
  });
}

export function useJoinVoiceChannel() {
  const queryClient = useQueryClient();
  const { setRoom } = useVoiceActions();

  return useMutation({
    mutationFn: async (channelId: string) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to join voice channels");

      const current = useVoiceChannelStore.getState();
      if (
        current.room &&
        current.activeChannelId &&
        current.activeChannelId !== channelId
      ) {
        current.room.disconnect();
        if (current.presenceId) {
          try {
            await pb
              .collection("voice_participants")
              .delete(current.presenceId);
          } catch {
            console.warn(
              "Failed to delete previous voice participant presence",
            );
          }
        }
      }

      const { token, url } = await getVoiceToken(channelId);
      const room = new Room();

      try {
        await room.connect(url, token);
        await room.localParticipant.setMicrophoneEnabled(true);

        let presenceId: string;
        try {
          const participant = await pb
            .collection<VoiceParticipant>("voice_participants")
            .create({ user: userId, channel: channelId });

          presenceId = participant.id;
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            const existing = await pb
              .collection<VoiceParticipant>("voice_participants")
              .getFirstListItem(
                `user = "${userId}" && channel = "${channelId}"`,
              );

            presenceId = existing.id;
          } else {
            throw err;
          }
        }

        return { room, channelId, presenceId };
      } catch (err) {
        room.disconnect();
        throw err;
      }
    },
    onSuccess: ({ room, channelId, presenceId }) => {
      setRoom(room, channelId, presenceId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.voiceParticipants.list(channelId),
      });
    },
  });
}

export function useLeaveVoiceChannel() {
  const queryClient = useQueryClient();
  const { clearRoom } = useVoiceActions();

  return useMutation({
    mutationFn: async () => {
      const { room, presenceId } = useVoiceChannelStore.getState();

      room?.disconnect();

      if (presenceId) {
        try {
          await pb.collection("voice_participants").delete(presenceId);
        } catch {
          console.warn("Failed to delete voice participant presence on leave");
        }
      }
    },
    onSuccess: () => {
      const channelId = useVoiceChannelStore.getState().activeChannelId;
      if (channelId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.voiceParticipants.list(channelId),
        });
      }
      clearRoom();
    },
  });
}

export function useVoiceParticipants(channelId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<VoiceParticipant[]>({
    queryKey: queryKeys.voiceParticipants.list(channelId),
    queryFn: () =>
      pb.collection("voice_participants").getFullList({
        filter: `channel = "${channelId}"`,
        expand: "user",
      }),
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;
    const release = getVoiceSubscription(channelId, queryClient);
    return release;
  }, [channelId, queryClient]);

  return query;
}

const registry = new Map<
  string,
  {
    refCount: number;
    unsubPromise: Promise<() => void>;
  }
>();

function getVoiceSubscription(
  channelId: string,
  queryClient: QueryClient,
): () => void {
  const queryKey = queryKeys.voiceParticipants.list(channelId);
  let entry = registry.get(channelId);

  if (!entry) {
    const unsubPromise = pb
      .collection("voice_participants")
      .subscribe<VoiceParticipant>(
        "*",
        (e) => {
          queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old = []) => {
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
          });
        },
        {
          filter: pb.filter("channel = {:id}", { id: channelId }),
          expand: "user",
        },
      );

    const newEntry = { refCount: 0, unsubPromise };
    entry = newEntry;
    registry.set(channelId, newEntry);

    unsubPromise.catch((err) => {
      console.warn("voice subscription failed:", err);
      if (registry.get(channelId) === newEntry) {
        registry.delete(channelId);
      }
    });
  }

  entry.refCount += 1;

  let released = false;

  return () => {
    if (released) return;
    released = true;

    const current = registry.get(channelId);
    if (!current) return;

    current.refCount -= 1;
    if (current.refCount <= 0) {
      registry.delete(channelId);
      current.unsubPromise.then((unsub) => unsub()).catch(() => {});
    }
  };
}
