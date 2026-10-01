import { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "cn";
import { Check } from "lucide-react";
import { COLORS } from "@/lib/constants";

export default function ColorPicker({
  currentColor,
  onColorSelect,
  side = "top",
  align = "end",
  children,
}: {
  currentColor: string;
  onColorSelect: (color: string) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          side={side}
          align={align}
          className={cn(
            "z-50 rounded-lg p-1.5",
            "border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800",
            "text-zinc-900 dark:text-white",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <div className="grid grid-cols-4 gap-1.5">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onColorSelect(color)}
                style={{ backgroundColor: color }}
                className={cn(
                  "relative size-8 rounded-full border-2 border-zinc-200 transition-all hover:scale-110 dark:border-zinc-600",
                )}
              >
                {currentColor === color && (
                  <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
