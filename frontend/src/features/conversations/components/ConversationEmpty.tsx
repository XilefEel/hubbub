import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";

export default function ConversationEmpty({
  user,
}: {
  user: User | undefined;
}) {
  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col justify-end gap-2 pb-8">
      <UserAvatar user={user} size="size-20" />

      <h1 className="text-3xl font-bold">{user.name}</h1>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This is the beginning of your direct message history with{" "}
        <span className="font-medium">{user.name}</span>.
      </p>
    </div>
  );
}
