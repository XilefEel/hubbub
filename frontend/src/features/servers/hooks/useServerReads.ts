import { useMyChannels } from "@/features/channels/hooks/useChannels";
import { useChannelReads } from "@/features/channels/hooks/useReadStates";
import { isChannelUnread } from "@/features/channels/utils/unread";
import { useMemo } from "react";

export function useServerUnreads() {
  const { data: channels } = useMyChannels();
  const { data: reads } = useChannelReads();

  return useMemo(() => {
    if (!channels || !reads) return undefined;

    const result = new Map<string, { unread: boolean; mentions: number }>();

    for (const c of channels) {
      if (c.type === "voice") continue;

      const readStates = reads.get(c.id);
      const entry = result.get(c.server) ?? { unread: false, mentions: 0 };

      if (isChannelUnread(c, readStates)) entry.unread = true;

      entry.mentions += readStates?.mentionCount ?? 0;
      result.set(c.server, entry);
    }

    return result;
  }, [channels, reads]);
}
