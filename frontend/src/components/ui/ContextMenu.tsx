import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cn } from "cn";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Checkbox from "./Checkbox";

export function ContextMenu({
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
            "border border-zinc-200 dark:border-zinc-700",
            "bg-white dark:bg-zinc-800",
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
  show = true,
  disabled,
  children,
}: {
  action: () => void;
  Icon: LucideIcon;
  label?: string;
  isDelete?: boolean;
  show?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  if (!show) return null;

  return (
    <RadixContextMenu.Item
      disabled={disabled}
      onSelect={() => action()}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors duration-100 outline-none",
        "text-zinc-900 dark:text-zinc-100",
        "dark:data-highlighted:bg-zinc-750 data-highlighted:bg-zinc-50",
        isDelete &&
          "text-red-600 data-highlighted:bg-red-50 dark:text-red-400 dark:data-highlighted:bg-red-900/30",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label ? <span>{label}</span> : children}
    </RadixContextMenu.Item>
  );
}

export function ContextMenuSeparator({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <RadixContextMenu.Separator className="my-1 shrink-0 border-t border-zinc-200 dark:border-zinc-700" />
  );
}

export function ContextSubMenu({
  Icon,
  label,
  show = true,
  disabled,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  show?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;

  return (
    <RadixContextMenu.Sub>
      <RadixContextMenu.SubTrigger
        disabled={disabled}
        className={cn(
          "flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors duration-100 outline-none",
          "text-zinc-900 dark:text-zinc-100",
          "dark:data-highlighted:bg-zinc-750 data-highlighted:bg-zinc-50",
          "dark:data-[state=open]:bg-zinc-750 data-[state=open]:bg-zinc-50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span>{label}</span>
        <ChevronRight className="ml-auto size-4 shrink-0" />
      </RadixContextMenu.SubTrigger>

      <RadixContextMenu.Portal>
        <RadixContextMenu.SubContent
          sideOffset={8}
          alignOffset={-8}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "z-50 min-w-56 rounded-lg p-2 shadow-lg select-none",
            "border border-zinc-200 dark:border-zinc-700",
            "bg-white dark:bg-zinc-800",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {children}
        </RadixContextMenu.SubContent>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Sub>
  );
}

export function ContextMenuCheckboxItem({
  checked,
  onToggle,
  disabled,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <RadixContextMenu.Item
      disabled={disabled}
      onSelect={(e) => {
        e.preventDefault();
        onToggle();
      }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex items-center gap-3 rounded py-1.5 text-sm transition-colors duration-100 outline-none",
        "text-zinc-900 dark:text-zinc-100",
        "dark:data-highlighted:bg-zinc-750 data-highlighted:bg-zinc-50",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <Checkbox
        checked={checked}
        tabIndex={-1}
        className="pointer-events-none"
      />

      {children}
    </RadixContextMenu.Item>
  );
}
