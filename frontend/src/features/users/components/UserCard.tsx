import Popover from "@/components/ui/Popover";
import FriendRequestButton from "@/features/friends/components/FriendRequestButton";
import UserAvatar from "@/features/users/components/UserAvatar";
import { pb } from "@/lib/pocketbase";
import type { User } from "@/lib/types";

export default function UserCard({
  user,
  children,
}: {
  user: User | undefined;
  children: React.ReactNode;
}) {
  const currentUserId = pb.authStore.record?.id;

  if (!user) return null;

  return (
    <Popover
      padding="p-0"
      side="right"
      trigger={children}
      content={
        <>
          <div
            style={{
              backgroundColor: user?.bannerColor ?? "#14B8A6",
            }}
            className="flex h-20 w-full items-start justify-end rounded-t-lg p-3"
          >
            {currentUserId !== user.id && <FriendRequestButton user={user} />}
          </div>

          <div className="px-3 pb-3">
            <div className="relative -mt-10 mb-2">
              <UserAvatar
                user={user}
                size="size-20"
                className="border-6 border-white dark:border-zinc-800"
              />
            </div>

            <h3 className="font-semibold">{user.name}</h3>

            {user.bio && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.bio}
              </p>
            )}
          </div>
        </>
      }
    />
  );
}
