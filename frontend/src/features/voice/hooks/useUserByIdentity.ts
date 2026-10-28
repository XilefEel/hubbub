import { useMemo } from "react";
import type { User, VoiceScope } from "@/lib/types";
import { useVoiceParticipants } from "./useVoiceParticipants";

export function useUserByIdentity(scope: VoiceScope) {
  const { data: participants } = useVoiceParticipants(scope);

  return useMemo(() => {
    const map = new Map<string, User>();
    for (const p of participants ?? []) {
      if (p.expand?.user) map.set(p.user, p.expand.user);
    }
    return map;
  }, [participants]);
}
