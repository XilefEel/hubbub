import Dialog from "../../../components/ui/Dialog";
import { useState } from "react";
import { useFriendships } from "@/features/friends/hooks/useFriendships";
import UserAvatar from "@/features/users/components/UserAvatar";
import { pb } from "@/lib/pocketbase";
import { useCreateGroup, useEditGroup } from "../hooks/useCreateGroup";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import { useNavigate } from "@tanstack/react-router";
import Checkbox from "@/components/ui/Checkbox";
import { useCreateGroupModal } from "./useCreateGroupModal";
import type { Conversation } from "@/lib/types";

export default function CreateGroupModal() {
  const { isOpen, closeModal, setIsOpen, conversation } = useCreateGroupModal();
  const isEdit = conversation?.isGroup === true;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={isEdit ? "Edit Group" : "Create Group"}
    >
      <CreateGroupForm
        key={conversation?.id ?? "new"}
        onDone={closeModal}
        conversation={conversation}
        isEdit={isEdit}
      />
    </Dialog>
  );
}

function CreateGroupForm({
  onDone,
  conversation,
  isEdit,
}: {
  onDone: () => void;
  conversation: Conversation | null;
  isEdit: boolean;
}) {
  const navigate = useNavigate();
  const userId = pb.authStore.record?.id;

  const { data: friendships } = useFriendships(userId);
  const createGroup = useCreateGroup();
  const editGroup = useEditGroup();

  const memberIds = (
    conversation?.expand?.conversation_members_via_conversation ?? []
  ).map((m) => m.user);

  const [name, setName] = useState(isEdit ? (conversation?.name ?? "") : "");
  const [selected, setSelected] = useState<string[]>(() =>
    isEdit ? [] : memberIds.filter((id) => id !== userId),
  );

  const friends = (friendships ?? []).flatMap((f) => {
    if (f.status !== "accepted") return [];
    const friend =
      f.requester === userId ? f.expand?.addressee : f.expand?.requester;

    return friend ? [friend] : [];
  });

  const validSelected = selected.filter(
    (id) =>
      friends.some((f) => f.id === id) && !(isEdit && memberIds.includes(id)),
  );

  const nameChanged = isEdit && name.trim() !== (conversation?.name ?? "");
  const maxSelectable = isEdit ? 10 - memberIds.length : 9;

  const canSubmit = isEdit
    ? (nameChanged || validSelected.length > 0) &&
      validSelected.length <= maxSelectable
    : validSelected.length >= 2 && validSelected.length <= 9;

  const isPending = createGroup.isPending || editGroup.isPending;

  const placeholderName =
    validSelected.length > 1
      ? validSelected
          .map((id) => friends.find((f) => f.id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : "Group name (optional)";

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const onSuccess = (conversationId: string) => {
    setName("");
    setSelected([]);
    onDone();
    navigate({
      to: "/me/conversations/$conversationId",
      params: { conversationId },
    });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (isEdit && conversation) {
      editGroup.mutate(
        {
          conversationId: conversation.id,
          userIds: validSelected,
          name: nameChanged ? name.trim() : undefined,
        },
        { onSuccess },
      );
      return;
    }

    createGroup.mutate(
      { userIds: validSelected, name: name.trim() || undefined },
      { onSuccess },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholderName}
      />

      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {friends.map((u) => {
          const alreadyIn = isEdit && memberIds.includes(u.id);
          return (
            <li key={u.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                <UserAvatar user={u} size="size-6" />
                <span className="flex-1 truncate">{u.name}</span>
                <Checkbox
                  checked={alreadyIn || selected.includes(u.id)}
                  disabled={alreadyIn}
                  onCheckedChange={() => toggle(u.id)}
                />
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end">
        <SubmitButton disabled={!canSubmit || isPending}>
          {isEdit ? "Save" : "Create Group"}
        </SubmitButton>
      </div>
    </form>
  );
}
