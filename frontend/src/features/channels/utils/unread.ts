import type { Channel, ReadState } from "@/lib/types";
import { isAfter } from "@/lib/utils";

export function isChannelUnread(channel: Channel, read?: ReadState) {
  return (
    channel.type !== "voice" &&
    !!channel.lastMessageAt &&
    (!read || isAfter(channel.lastMessageAt, read.lastReadAt))
  );
}
