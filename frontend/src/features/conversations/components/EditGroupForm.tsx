import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import { pb } from "@/lib/pocketbase";
import type { Conversation } from "@/lib/types";
import { useState } from "react";
import { useEditGroup } from "../hooks/useCreateGroup";
import FriendPicker from "./FriendPicker";
import { useAcceptedFriends } from "@/features/friends/hooks/useAcceptedFriends";

export default function EditGroupForm({
  onDone,
  conversation,
}: {
  onDone: () => void;
  conversation: Conversation;
}) {
  const userId = pb.authStore.record?.id;

  const friends = useAcceptedFriends(userId);
  const editGroup = useEditGroup();

  const memberIds = (
    conversation.expand?.conversation_members_via_conversation ?? []
  ).map((m) => m.user);

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const validSelected = selected.filter(
    (id) => friends.some((f) => f.id === id) && !memberIds.includes(id),
  );

  const canSubmit =
    validSelected.length >= 1 && validSelected.length <= 10 - memberIds.length;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    editGroup.mutate(
      {
        conversationId: conversation.id,
        userIds: validSelected,
        name: name.trim() || undefined,
      },
      {
        onSuccess: onDone,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={conversation.name || "Group name (optional)"}
      />

      <FriendPicker
        friends={friends}
        selected={selected}
        onToggle={toggle}
        disabledIds={memberIds}
      />

      <div className="flex justify-end">
        <SubmitButton disabled={!canSubmit || editGroup.isPending}>
          Save
        </SubmitButton>
      </div>
    </form>
  );
}
