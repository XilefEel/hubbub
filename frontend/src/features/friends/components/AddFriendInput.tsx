// features/friends/components/AddFriendTab.tsx
import { useState } from "react";
import { useSendFriendRequest } from "../hooks/useSendFriendRequest";
import { cn } from "cn";
import type { FriendRequestStatus } from "@/lib/types";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";

const MESSAGES: Record<
  FriendRequestStatus,
  { text: string; tone: "success" | "error" }
> = {
  sent: { text: "Friend request sent!", tone: "success" },
  not_found: { text: "No user found with that username.", tone: "error" },
  self: { text: "You can't add yourself as a friend.", tone: "error" },
  already_friends: {
    text: "You are already friends with this user.",
    tone: "error",
  },
  already_pending: {
    text: "You already have a pending friend request with this user.",
    tone: "error",
  },
};

export default function AddFriendTab() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<FriendRequestStatus | null>(null);

  const sendRequest = useSendFriendRequest();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    sendRequest.mutate(trimmed, {
      onSuccess: (result) => {
        setStatus(result.status);
        if (result.status === "sent") setUsername("");
      },
    });
  };

  const feedback = status ? MESSAGES[status] : null;

  return (
    <div className="flex flex-col p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add a friend by username"
        />

        <SubmitButton disabled={sendRequest.isPending || !username.trim()}>
          Send
        </SubmitButton>
      </form>

      {feedback && (
        <p
          className={cn(
            "text-sm",
            feedback.tone === "success" ? "text-teal-500" : "text-red-500",
          )}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
