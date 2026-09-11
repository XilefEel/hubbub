import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "cn";
import { X } from "lucide-react";

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <RadixDialog.Content
          className={cn(
            "fixed w-full max-w-md rounded-xl p-4 shadow-lg",
            "top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "border border-zinc-200",
            "bg-white",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <RadixDialog.Title className="text-lg font-semibold">
              {title}
            </RadixDialog.Title>

            <RadixDialog.Close className="text-zinc-400 hover:text-zinc-600">
              <X className="size-4 shrink-0" />
            </RadixDialog.Close>
          </div>

          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
