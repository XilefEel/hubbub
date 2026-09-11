import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function MessageActions({
  isPending,
  onEdit,
  onDelete,
}: {
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="ml-auto hidden items-center gap-2 group-hover:flex">
      <button
        disabled={isPending}
        onClick={onEdit}
        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
      >
        <Pencil className="size-4 shrink-0" />
      </button>

      <button
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
      >
        <Trash className="size-4 shrink-0" />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete message?"
        description="This action cannot be undone."
        isPending={isPending}
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
