import type { User } from "@/lib/types";
import { Clock, UserRoundCheck, UserRoundX, UserRoundPlus } from "lucide-react";
import {
  useFriendshipStatus,
  useSendFriendRequest,
  useRespondToFriendRequest,
} from "../hooks/useFriendships";
import Tooltip from "@/components/ui/Tooltip";

export default function FriendRequestButton({ user }: { user: User }) {
  const { data: relation } = useFriendshipStatus(user?.id);

  const sendRequest = useSendFriendRequest();
  const respondToFriendRequest = useRespondToFriendRequest();

  const handleAccept = (friendshipId: string) => {
    respondToFriendRequest.mutate({ friendshipId, accept: true });
  };

  const handleRemove = (friendshipId: string) => {
    respondToFriendRequest.mutate({ friendshipId, accept: false });
  };

  const handleSubmit = () => sendRequest.mutate(user.name);

  if (relation?.kind === "outgoing_pending") {
    return (
      <Tooltip content="Friend Request Sent">
        <span className="rounded-full bg-black/50 p-1.5 text-sm text-white opacity-70">
          <Clock className="size-4 shrink-0" />
        </span>
      </Tooltip>
    );
  }

  if (relation?.kind === "incoming_pending") {
    return (
      <Tooltip content="Accept Friend Request">
        <button
          onClick={() => handleAccept(relation.friendship.id)}
          className="rounded-full bg-black/50 p-1.5 text-sm text-white transition-colors duration-100 hover:text-teal-400"
        >
          <UserRoundCheck className="size-4 shrink-0" />
        </button>
      </Tooltip>
    );
  }

  if (relation?.kind === "friends") {
    return (
      <Tooltip content="Remove Friend">
        <button
          onClick={() => handleRemove(relation.friendship.id)}
          className="rounded-full bg-black/50 p-1.5 text-sm text-white transition-colors duration-100 hover:text-red-400"
        >
          <UserRoundX className="size-4 shrink-0" />
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Add Friend">
      <button
        onClick={handleSubmit}
        className="rounded-full bg-black/50 p-1.5 text-sm text-white transition-colors duration-100 hover:text-teal-400"
      >
        <UserRoundPlus className="size-4 shrink-0" />
      </button>
    </Tooltip>
  );
}
