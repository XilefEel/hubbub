import BasePopover from "@/components/ui/Popover";
import UserAvatar from "@/features/users/components/UserAvatar";
import type { User } from "@/lib/types";

export default function UserCard({
  user,
  children,
}: {
  user: User | undefined;
  children: React.ReactNode;
}) {
  if (!user) return null;

  return (
    <BasePopover
      padding="p-0"
      side="right"
      trigger={children}
      content={
        <>
          <div className="h-20 w-full rounded-t-lg bg-teal-500" />

          <div className="px-3 pb-3">
            <div className="relative -mt-10 mb-2">
              <UserAvatar
                user={user}
                size="size-20"
                className="border-6 border-white dark:border-zinc-800"
              />
            </div>

            <h3 className="font-semibold">{user.name}</h3>
          </div>
        </>
      }
    />
  );
}
