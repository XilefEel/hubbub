import { pb } from "./pocketbase";
import type { Message, Reaction } from "./types";

export function formatMessageDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${day}/${month}/${year}, ${time}`;
}

export function getMessageImageUrl(message: Message) {
  if (!message.attachment) return null;
  return pb.files.getURL(message, message.attachment);
}

export function groupReactionsByMessage(
  reactions: Reaction[] | undefined,
): Map<string, Reaction[]> {
  const map = new Map<string, Reaction[]>();

  for (const r of reactions ?? []) {
    const existing = map.get(r.message) ?? [];
    existing.push(r);
    map.set(r.message, existing);
  }

  return map;
}

export function groupReactionsByEmoji(
  reactions: Reaction[],
  currentUserId: string | undefined,
): {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}[] {
  const map = new Map<string, Reaction[]>();

  for (const r of reactions) {
    const list = map.get(r.emoji) ?? [];
    list.push(r);
    map.set(r.emoji, list);
  }

  return [...map.entries()].map(([emoji, list]) => ({
    emoji,
    count: list.length,
    reactedByMe: list.some((r) => r.user === currentUserId),
  }));
}
