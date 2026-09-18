import type { Room } from "livekit-client";
import {
  useIsDeafened,
  useIsMuted,
  useVoiceActions,
  useVoiceRoom,
} from "../stores/useVoiceChannelStore";
import { useLeaveVoiceChannel } from "./useVoiceChannel";

export function useVoiceControls() {
  const { setMuted, setDeafened } = useVoiceActions();
  const room = useVoiceRoom();
  const isMuted = useIsMuted();
  const isDeafened = useIsDeafened();
  const leaveVoice = useLeaveVoiceChannel();

  const toggleMute = async () => {
    if (!room) return;
    const next = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);

    if (!next && isDeafened) {
      setDeafened(false);
      setRemoteAudioEnabled(room, true);
    }
  };

  const toggleDeafen = async () => {
    if (!room) return;
    const next = !isDeafened;
    setDeafened(next);
    setRemoteAudioEnabled(room, !next);

    if (next && !isMuted) {
      await room.localParticipant.setMicrophoneEnabled(false);
      setMuted(true);
    }
  };

  const disconnect = () => {
    leaveVoice.mutate();
  };

  return { toggleMute, toggleDeafen, disconnect };
}

function setRemoteAudioEnabled(room: Room, enabled: boolean) {
  room.remoteParticipants.forEach((participant) => {
    participant.audioTrackPublications.forEach((pub) => {
      if (pub.track) {
        pub.track.mediaStreamTrack.enabled = enabled;
      }
    });
  });
}
