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
import Checkbox from "@/components/ui/Checkbox";

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
    if (selected.length < 2 || selected.length > 9) return;

    createGroup.mutate(
      {
        userIds: selected,
        name: name.trim() || undefined,
      },
      {
        onSuccess,
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

      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {friends.map((u) => (
          <li key={u.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
              <UserAvatar user={u} size="size-6" />
              <span className="flex-1 truncate">{u.name}</span>
              <Checkbox
                checked={selected.includes(u.id)}
                onCheckedChange={() => toggle(u.id)}
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <SubmitButton
          disabled={
            selected.length < 2 || selected.length > 9 || createGroup.isPending
          }
        >
          Create Group
        </SubmitButton>
      </div>
    </form>
  );
}
