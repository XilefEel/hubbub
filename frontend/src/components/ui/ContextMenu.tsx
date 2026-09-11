import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export function BaseContextMenu({
  children,
  content,
  disabled = false,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <RadixContextMenu.Root>
      <RadixContextMenu.Trigger disabled={disabled} asChild>
        {children}
      </RadixContextMenu.Trigger>

      <RadixContextMenu.Portal>
        <RadixContextMenu.Content
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "z-50 min-w-55 rounded-lg p-2 shadow-lg select-none",
            "bg-white",
            "border border-zinc-200",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {content}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
}

export function ContextMenuItem({
  action,
  Icon,
  label,
  isDelete,
  disabled,
  children,
}: {
  action: () => void;
  Icon: LucideIcon;
  label?: string;
  isDelete?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <RadixContextMenu.Item
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors outline-none",
        "hover:bg-zinc-50",
        isDelete && "text-red-600 hover:bg-red-50",
        disabled && "pointer-events-none opacity-50",
      )}
      onSelect={() => action()}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="size-4 shrink-0" />
      {label ? <span>{label}</span> : children}
    </RadixContextMenu.Item>
  );
}

export function ContextMenuSeparator() {
  return (
    <RadixContextMenu.Separator className="my-1 shrink-0 border-t border-zinc-200" />
  );
}
