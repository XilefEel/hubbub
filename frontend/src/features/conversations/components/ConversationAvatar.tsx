import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";
import { cn } from "cn";

export default function ConversationAvatar({
  users,
  isGroup,
  size = "size-8",
}: {
  users: User[];
  isGroup: boolean;
  size?: string;
}) {
  if (!isGroup) return <UserAvatar user={users[0]} size={size} />;

  return (
    <div className={cn("relative shrink-0", size)}>
      <UserAvatar
        user={users[0]}
        size="size-2/3"
        className="absolute top-0 left-0"
      />
      <UserAvatar
        user={users[1]}
        size="size-2/3"
        className="absolute right-0 bottom-0"
      />
    </div>
  );
}
