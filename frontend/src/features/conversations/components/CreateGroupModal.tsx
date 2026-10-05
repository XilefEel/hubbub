import Dialog from "../../../components/ui/Dialog";
import { useState } from "react";
import { useCreateGroupModal } from "@/app/modals/useModalStore";
import { useFriendships } from "@/features/friends/hooks/useFriendships";
import UserAvatar from "@/features/users/components/UserAvatar";
import { pb } from "@/lib/pocketbase";
import { useCreateGroup } from "../hooks/useCreateGroup";
import SubmitButton from "@/components/ui/SubmitButton";

export default function CreateGroupModal() {
  const { isOpen, closeModal, setIsOpen } = useCreateGroupModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create Group">
      <CreateGroupForm onDone={closeModal} />
    </Dialog>
  );
}

function CreateGroupForm({ onDone }: { onDone: () => void }) {
  const userId = pb.authStore.record?.id;

  const { data: friendships } = useFriendships(userId);
  const createGroup = useCreateGroup();

  const [selected, setSelected] = useState<string[]>([]);

  const friends = (friendships ?? []).flatMap((f) => {
    if (f.status !== "accepted") return [];
    const friend =
      f.requester === userId ? f.expand?.addressee : f.expand?.requester;
    return friend ? [friend] : [];
  });

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="flex flex-col gap-3">
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
        onClick={() => createGroup.mutate(selected, { onSuccess: onDone })}
      >
        Create Group
      </SubmitButton>
    </div>
  );
}
