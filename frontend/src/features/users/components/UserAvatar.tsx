import { cn } from "cn";
import StatusDot from "./StatusDot";
import { pb } from "@/lib/pocketbase";
import type { User } from "@/lib/types";

export default function UserAvatar({
  user,
  size = "size-10",
  className,
  showStatus = false,
  statusClassName,
}: {
  user?: User;
  size?: string;
  className?: string;
  showStatus?: boolean;
  statusClassName?: string;
}) {
  const avatar = user?.avatar ? (
    <img
      src={pb.files.getURL(user, user.avatar, { thumb: "100x100" })}
      alt={user.name}
      className={cn("shrink-0 rounded-full object-cover", size, className)}
    />
  ) : (
    <div
      className={cn(
        "shrink-0 rounded-full bg-teal-100 dark:bg-teal-800/50",
        size,
        className,
      )}
    />
  );

  if (!showStatus || !user) return avatar;

  return (
    <div className="relative inline-block shrink-0">
      {avatar}
      <StatusDot userId={user.id} className={statusClassName} />
    </div>
  );
}
