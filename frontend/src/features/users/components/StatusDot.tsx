import { useOnlineUsers } from "@/features/members/hooks/usePresence";
import type { PresenceStatus } from "@/lib/types";
import { cn } from "cn";

const DOT_COLOR: Record<PresenceStatus | "offline", string> = {
  online: "bg-green-500",
  dnd: "bg-red-500",
  offline: "bg-zinc-400",
};

export default function StatusDot({
  userId,
  className = "size-2 right-0 bottom-0 ring-2",
}: {
  userId: string;
  className?: string;
}) {
  const online = useOnlineUsers();
  const status: PresenceStatus | "offline" = online[userId] ?? "offline";

  return (
    <span
      className={cn(
        "absolute rounded-full ring-white dark:ring-zinc-800",
        DOT_COLOR[status],
        className,
      )}
    />
  );
}
