import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "cn";

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

        <AlertDialog.Content
          className={cn(
            "fixed w-full max-w-sm rounded-xl p-4 shadow-lg",
            "top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "border border-zinc-200",
            "bg-white",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
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
