import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "livekit-client";
import { pb } from "../lib/pocketbase";
import type { VoiceParticipant, VoiceTokenResponse } from "../lib/types";
import {
  useVoiceActions,
  useVoiceChannelStore,
} from "../stores/useVoiceChannelStore";
import { useEffect } from "react";
import { queryKeys } from "../lib/querykeys";

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
          await pb.collection("voice_participants").delete(current.presenceId);
        }
      }

      const { token, url } = await getVoiceToken(channelId);

      const room = new Room();

      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          participant: RemoteParticipant,
        ) => {
          const el = track.attach();
          if (track.kind === Track.Kind.Audio) {
            document.body.appendChild(el);
          } else if (track.kind === Track.Kind.Video) {
            document
              .getElementById(`participant-${participant.identity}`)
              ?.appendChild(el);
          }
        },
      );

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove());
      });

      const existing = await pb
        .collection<VoiceParticipant>("voice_participants")
        .getFullList({
          filter: `user = "${userId}" && channel = "${channelId}"`,
        });

      await Promise.all(
        existing.map((r) => pb.collection("voice_participants").delete(r.id)),
      );

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      const participant = await pb
        .collection<VoiceParticipant>("voice_participants")
        .create({
          user: userId,
          channel: channelId,
        });

      return { room, channelId, presenceId: participant.id };
    },
    onSuccess: ({ room, channelId, presenceId }) => {
      setRoom(room, channelId, presenceId);
      queryClient.invalidateQueries({
        queryKey: ["voice_participants", channelId],
      });
    },
    onError: (_err, channelId) => {
      const state = useVoiceChannelStore.getState();
      if (state.activeChannelId === channelId) {
        state.room?.disconnect();
      }
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
        await pb.collection("voice_participants").delete(presenceId);
      }
    },
    onSuccess: () => {
      const channelId = useVoiceChannelStore.getState().activeChannelId;
      queryClient.invalidateQueries({
        queryKey: queryKeys.voiceParticipants.list(channelId!),
      });
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
          if (e.action === "create") {
            queryClient.setQueryData<VoiceParticipant[]>(
              queryKey,
              (old = []) => {
                if (old.some((vp) => vp.id === e.record.id)) return old;
                return [...old, e.record];
              },
            );
          }
          if (e.action === "update") {
            queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old = []) =>
              old.map((vp) => (vp.id === e.record.id ? e.record : vp)),
            );
          }
          if (e.action === "delete") {
            queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old = []) =>
              old.filter((vp) => vp.id !== e.record.id),
            );
          }
        },
        { filter: `channel = "${channelId}"`, expand: "user" },
      );

    entry = { refCount: 0, unsubPromise };
    registry.set(channelId, entry);
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
      current.unsubPromise.then((unsub) => unsub());
    }
  };
}
