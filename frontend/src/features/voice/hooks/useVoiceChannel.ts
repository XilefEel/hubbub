import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Room } from "livekit-client";
import { pb } from "@/lib/pocketbase";
import type {
  VoiceParticipant,
  VoiceScope,
  VoiceTokenResponse,
} from "@/lib/types";
import { queryKeys } from "@/lib/querykeys";
import { isUniqueConstraintError } from "@/lib/utils";
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
  const queryClient = useQueryClient();
  const { setRoom } = useVoiceActions();

  return useMutation({
    mutationFn: async (scope: VoiceScope) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to join voice channels");

      const current = useVoiceChannelStore.getState();

      const sameRoom =
        current.activeScope?.type === scope.type &&
        current.activeScope?.id === scope.id;

      if (current.room && current.activeScope && !sameRoom) {
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

      const { token, url } = await getVoiceToken(scope);
      const room = new Room();

      try {
        await room.connect(url, token);
        await room.localParticipant.setMicrophoneEnabled(true);

        let presenceId: string;
        try {
          const participant = await pb
            .collection<VoiceParticipant>("voice_participants")
            .create({ user: userId, [scope.type]: scope.id });

          presenceId = participant.id;
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            const existing = await pb
              .collection<VoiceParticipant>("voice_participants")
              .getFirstListItem(
                pb.filter(`user = {:user} && ${scope.type} = {:id}`, {
                  user: userId,
                  id: scope.id,
                }),
              );

            presenceId = existing.id;
          } else {
            throw err;
          }
        }

        return { room, scope, presenceId };
      } catch (err) {
        room.disconnect();
        throw err;
      }
    },
    onSuccess: ({ room, scope, presenceId }) => {
      setRoom(room, scope, presenceId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.voiceParticipants.list(scope.type, scope.id),
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
      const scope = useVoiceChannelStore.getState().activeScope;
      if (scope) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.voiceParticipants.list(scope.type, scope.id),
        });
      }
      clearRoom();
    },
  });
}
