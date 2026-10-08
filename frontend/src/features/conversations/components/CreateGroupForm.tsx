import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import { pb } from "@/lib/pocketbase";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateGroup } from "../hooks/useCreateGroup";
import FriendPicker from "./FriendPicker";
import { useAcceptedFriends } from "@/features/friends/hooks/useAcceptedFriends";

export default function CreateGroupForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const userId = pb.authStore.record?.id;

  const friends = useAcceptedFriends(userId);
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const validSelected = selected.filter((id) =>
    friends.some((f) => f.id === id),
  );

  const canSubmit = validSelected.length >= 2 && validSelected.length <= 9;

  const placeholderName =
    validSelected.length > 1
      ? validSelected
          .map((id) => friends.find((f) => f.id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : "Group name (optional)";

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createGroup.mutate(
      { userIds: validSelected, name: name.trim() || undefined },
      {
        onSuccess: (conversationId: string) => {
          onDone();
          navigate({
            to: "/me/conversations/$conversationId",
            params: { conversationId },
          });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholderName}
      />

      <FriendPicker friends={friends} selected={selected} onToggle={toggle} />

      <div className="flex justify-end">
        <SubmitButton disabled={!canSubmit || createGroup.isPending}>
          Create Group
        </SubmitButton>
      </div>
    </form>
  );
}
