import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { VoiceScope } from "@/lib/types";
import {
  useVoiceParticipantsQuery,
  selectByChannel,
  selectByConversation,
  useVoiceParticipantsSync,
} from "../utils/voice";

export function useVoiceParticipants({ type, id }: VoiceScope) {
  return useVoiceParticipantsQuery({
    queryKey: queryKeys.voiceParticipants.byParent(type, id),
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

export function useVoiceParticipantsSubscription({ type, id }: VoiceScope) {
  useVoiceParticipantsSync({
    queryKey: queryKeys.voiceParticipants.byParent(type, id),
    filter: pb.filter(`${type} = {:id}`, { id }),
    enabled: !!id,
  });
}

export function useServerCallsSubscription(serverId: string) {
  useVoiceParticipantsSync({
    queryKey: queryKeys.voiceParticipants.byServer(serverId),
    filter: pb.filter("channel.server = {:id}", { id: serverId }),
    enabled: !!serverId,
  });
}

export function useDmCallsSubscription() {
  const userId = pb.authStore.record?.id ?? "";

  useVoiceParticipantsSync({
    queryKey: queryKeys.voiceParticipants.dmCalls(),
    filter: pb.filter(
      "conversation.conversation_members_via_conversation.user ?= {:me}",
      { me: userId },
    ),
    enabled: !!userId,
  });
}
