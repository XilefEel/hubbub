import * as AlertDialog from "@radix-ui/react-alert-dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-1 text-sm text-zinc-500">
            {description}
          </AlertDialog.Description>

          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel
              disabled={isPending}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </AlertDialog.Cancel>

            <AlertDialog.Action
              disabled={isPending}
              onClick={onConfirm}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50"
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
