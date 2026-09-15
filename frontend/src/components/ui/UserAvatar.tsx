import { cn } from "cn";
import { pb } from "../../lib/pocketbase";
import type { User } from "../../lib/types";

export default function UserAvatar({
  user,
  size = "size-10",
}: {
  user?: User;
  size?: string;
}) {
  if (user?.avatar) {
    return (
      <img
        src={pb.files.getURL(user, user.avatar)}
        alt={user.name}
        className={cn("shrink-0 rounded-full object-cover", size)}
      />
    );
  }

  return <div className={cn("shrink-0 rounded-full bg-teal-100", size)} />;
}
