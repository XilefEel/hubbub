import type { Conversation, User } from "@/lib/types";
import { isAfter } from "date-fns";

export function getOtherUsers(
  conversation: Conversation,
  myId: string | undefined,
): User[] {
  const members =
    conversation.expand?.conversation_members_via_conversation ?? [];

  return members.flatMap((m) => {
    const user = m.expand?.user;
    return user && user.id !== myId ? [user] : [];
  });
}

export function getConversationTitle(
  conversation: Conversation,
  myId: string | undefined,
) {
  if (conversation.name) return conversation.name;

  const others = getOtherUsers(conversation, myId);

  if (conversation.isGroup)
    return others.map((u) => u.name).join(", ") || "Group";

  return others[0]?.name ?? "Unknown User";
}

export function isConversationHidden(
  conversation: Conversation,
  userId?: string,
) {
  const me = conversation.expand?.conversation_members_via_conversation?.find(
    (m) => m.user === userId,
  );
  if (!me?.hiddenAt) return false;
  if (!conversation.lastMessageAt) return true;

  return !isAfter(conversation.lastMessageAt, me.hiddenAt);
}

export function isConversationUnread(
  conversation: Conversation,
  userId?: string,
) {
  if (!conversation.lastMessageAt) return false;

  const me = conversation.expand?.conversation_members_via_conversation?.find(
    (m) => m.user === userId,
  );
  if (!me) return false;
  if (!me.lastReadAt) return true;

  return isAfter(conversation.lastMessageAt, me.lastReadAt);
}
