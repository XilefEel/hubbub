import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "cn";
import { useState } from "react";

export default function BasePopover({
  trigger,
  content,
  align = "start",
  side = "bottom",
  width = "w-80",
  padding = "p-4",
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  width?: string;
  padding?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={setIsOpen}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={8}
          side={side}
          align={align}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(
            "z-50 rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800",
            "text-zinc-900 dark:text-white",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            width,
            padding,
          )}
        >
          {content}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
