import { useMutation } from "@tanstack/react-query";
import { Room } from "livekit-client";
import { pb } from "@/lib/pocketbase";
import type { VoiceScope, VoiceTokenResponse } from "@/lib/types";
import {
  useVoiceActions,
  useVoiceChannelStore,
} from "../store/useVoiceChannelStore";

async function getVoiceToken(scope: VoiceScope): Promise<VoiceTokenResponse> {
  return pb.send("/api/voice/token", {
    method: "POST",
    body: { type: scope.type, id: scope.id },
  });
}

export function useJoinVoiceChannel() {
  const { setRoom } = useVoiceActions();

  return useMutation({
    mutationFn: async (scope: VoiceScope) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to join voice channels");

      const current = useVoiceChannelStore.getState();

      const sameRoom =
        current.activeScope?.type === scope.type &&
        current.activeScope?.id === scope.id;

      if (current.room && sameRoom) {
        return { room: current.room, scope };
      }

      if (current.room) {
        current.room.disconnect();
      }

      const { token, url } = await getVoiceToken(scope);
      const room = new Room();

      try {
        await room.connect(url, token);
        await room.localParticipant.setMicrophoneEnabled(true);

        return { room, scope };
      } catch (err) {
        room.disconnect();
        throw err;
      }
    },
    onSuccess: ({ room, scope }) => {
      setRoom(room, scope);
    },
  });
}

export function useLeaveVoiceChannel() {
  const { clearRoom } = useVoiceActions();

  return useMutation({
    mutationFn: async () => useVoiceChannelStore.getState().room?.disconnect(),
    onSuccess: clearRoom,
  });
}
