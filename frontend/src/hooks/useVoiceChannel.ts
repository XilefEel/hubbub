import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "livekit-client";
import { pb } from "../lib/pocketbase";
import type { VoiceTokenResponse } from "../lib/types";
import {
  useVoiceActions,
  useVoiceChannelStore,
} from "../stores/useVoiceChannelStore";

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

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      return { room, channelId };
    },
    onSuccess: ({ room, channelId }) => {
      setRoom(room, channelId);
      queryClient.invalidateQueries({
        queryKey: ["voice_participants", channelId],
      });
    },
  });
}

export function useLeaveVoiceChannel() {
  const { clearRoom } = useVoiceActions();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const room = useVoiceChannelStore.getState().room;
      room?.disconnect();
    },
    onSuccess: () => {
      clearRoom();
    },
  });
}
