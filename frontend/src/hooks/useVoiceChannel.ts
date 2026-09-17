import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

      const participantRecord = await pb
        .collection<VoiceParticipant>("voice_participants")
        .create({
          user: userId,
          channel: channelId,
        });

      return { room, channelId, participantRecordId: participantRecord.id };
    },
    onSuccess: ({ room, channelId, participantRecordId }) => {
      setRoom(room, channelId, participantRecordId);
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
      const { room, participantRecordId } = useVoiceChannelStore.getState();

      room?.disconnect();

      if (participantRecordId) {
        await pb.collection("voice_participants").delete(participantRecordId);
      }
    },
    onSuccess: () => {
      const activeChannelId = useVoiceChannelStore.getState().activeChannelId;
      queryClient.invalidateQueries({
        queryKey: ["voice_participants", activeChannelId],
      });
      clearRoom();
    },
  });
}

export function useVoiceParticipants(channelId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["voice_participants", channelId];

  const query = useQuery<VoiceParticipant[]>({
    queryKey,
    queryFn: () =>
      pb.collection("voice_participants").getFullList({
        filter: `channel = "${channelId}"`,
        expand: "user",
      }),
    enabled: !!channelId,
  });

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;

    pb.collection("voice_participants")
      .subscribe<VoiceParticipant>(
        "*",
        (e) => {
          if (e.action === "create") {
            queryClient.setQueryData<VoiceParticipant[]>(
              queryKey,
              (old = []) => {
                if (old.some((msg) => msg.id === e.record.id)) return old;
                return [...old, e.record];
              },
            );
          }

          if (e.action === "update") {
            queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old = []) =>
              old.map((msg) => (msg.id === e.record.id ? e.record : msg)),
            );
          }

          if (e.action === "delete") {
            queryClient.setQueryData<VoiceParticipant[]>(queryKey, (old = []) =>
              old.filter((msg) => msg.id !== e.record.id),
            );
          }
        },
        {
          filter: `channel = "${channelId}"`,
          expand: "user",
        },
      )
      .then((fn) => {
        if (cancelled) fn();
        else unsub = fn;
      })
      .catch((err) => console.warn("voice channel subscription failed:", err));

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, queryClient]);

  return query;
}
