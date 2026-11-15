import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "cn";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  Icon?: LucideIcon;
};

export default function Select<T extends string>({
  value,
  onValueChange,
  options,
  disabled,
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={cn(
          "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-100 disabled:opacity-50",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800",
          "border border-zinc-200 dark:border-zinc-700",
          "focus:outline-none focus-visible:ring focus-visible:ring-teal-500",
          className,
        )}
      >
        <RadixSelect.Value />

        <RadixSelect.Icon>
          <ChevronDown className="size-4 shrink-0 text-zinc-500" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 min-w-(--radix-select-trigger-width) rounded-md shadow-md",
            "bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "flex items-center justify-between gap-2 rounded px-3 py-1.5 transition-colors duration-100 outline-none select-none",
                  "text-sm text-zinc-900 dark:text-zinc-100",
                  "dark:data-highlighted:bg-zinc-750 data-highlighted:bg-zinc-50",
                )}
              >
                <RadixSelect.ItemText>
                  <span className="flex items-center gap-2">
                    {o.Icon && <o.Icon className="size-4 shrink-0" />}
                    {o.label}
                  </span>
                </RadixSelect.ItemText>

                <RadixSelect.ItemIndicator>
                  <Check className="size-4 text-teal-500" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
