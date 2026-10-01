import { Video } from "lucide-react";
import type { User } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import UserAvatar from "@/features/users/components/UserAvatar";

export default function ConversationHeader({
  partner,
}: {
  partner: User | undefined;
}) {
  return (
    <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <UserAvatar user={partner} size="size-6" />
        {partner?.name}
      </h2>

      <Tooltip content="Start a video call">
        <button
          onClick={() => {}}
          className="text-sm transition-colors duration-100 hover:text-teal-500 dark:hover:text-teal-400"
        >
          <Video className="size-4 shrink-0" />
        </button>
      </Tooltip>
    </div>
  );
}
