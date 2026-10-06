import Dialog from "../../../components/ui/Dialog";
import { useState } from "react";
import { useCreateGroupModal } from "@/app/modals/useModalStore";
import { useFriendships } from "@/features/friends/hooks/useFriendships";
import UserAvatar from "@/features/users/components/UserAvatar";
import { pb } from "@/lib/pocketbase";
import { useCreateGroup } from "../hooks/useCreateGroup";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import { useNavigate } from "@tanstack/react-router";

export default function CreateGroupModal() {
  const { isOpen, closeModal, setIsOpen } = useCreateGroupModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create Group">
      <CreateGroupForm onDone={closeModal} />
    </Dialog>
  );
}

function CreateGroupForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const userId = pb.authStore.record?.id;

  const { data: friendships } = useFriendships(userId);
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const friends = (friendships ?? []).flatMap((f) => {
    if (f.status !== "accepted") return [];
    const friend =
      f.requester === userId ? f.expand?.addressee : f.expand?.requester;

    return friend ? [friend] : [];
  });

  const placeholderName =
    selected.length > 1
      ? selected
          .map((id) => friends.find((f) => f.id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : selected.length
        ? "A group must have at least 3 members"
        : "Select Friends";

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

    if (selected.length < 2 || selected.length > 9) return;
    const groupName = name.trim() || placeholderName;

    createGroup.mutate(
      {
        userIds: selected,
        name: groupName,
      },
      {
        onSuccess,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholderName}
      />

      <ul className="flex max-h-64 flex-col overflow-y-auto">
        {friends.map((u) => (
          <li key={u.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggle(u.id)}
              />
              <UserAvatar user={u} size="size-6" />
              {u.name}
            </label>
          </li>
        ))}
      </ul>

      <SubmitButton
        disabled={
          selected.length < 2 || selected.length > 9 || createGroup.isPending
        }
      >
        Create Group
      </SubmitButton>
    </form>
  );
}
