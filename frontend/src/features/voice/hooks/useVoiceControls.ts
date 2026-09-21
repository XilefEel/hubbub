import type { Room } from "livekit-client";
import {
  useIsDeafened,
  useIsVideoEnabled,
  useIsScreenSharing,
  useIsMuted,
  useVoiceActions,
  useVoiceRoom,
} from "../store/useVoiceChannelStore";
import { useLeaveVoiceChannel } from "./useVoiceChannel";

export function useVoiceControls() {
  const { setMuted, setDeafened, setVideoEnabled, setScreenSharing } =
    useVoiceActions();
  const room = useVoiceRoom();
  const isMuted = useIsMuted();
  const isDeafened = useIsDeafened();
  const isVideoEnabled = useIsVideoEnabled();
  const isScreenSharing = useIsScreenSharing();
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

  const toggleVideo = async () => {
    if (!room) return;
    const next = !isVideoEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setVideoEnabled(next);
  };

  const toggleScreenShare = async () => {
    if (!room) return;
    const next = !isScreenSharing;
    await room.localParticipant.setScreenShareEnabled(next);
    setScreenSharing(next);
  };

  const disconnect = () => {
    leaveVoice.mutate();
  };

  return {
    toggleMute,
    toggleDeafen,
    toggleVideo,
    toggleScreenShare,
    disconnect,
  };
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
