import UserAvatar from "@/features/users/components/UserAvatar";
import { Link } from "@tanstack/react-router";
import { useConversationPartner } from "../hooks/useConversationMembers";

export default function ConversationItem({
  conversationId,
}: {
  conversationId: string;
}) {
  const partner = useConversationPartner(conversationId);

  return (
    <Link
      to="/me/conversations/$conversationId"
      params={{ conversationId }}
      className="flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
      activeProps={{ className: "bg-zinc-100 dark:bg-zinc-700" }}
    >
      <UserAvatar user={partner} size="size-8" />
      <span className="truncate">{partner?.name ?? "Unknown User"}</span>
    </Link>
  );
}
