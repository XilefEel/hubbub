import { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "cn";
import { Check } from "lucide-react";

const COLORS = [
  "#F87171", // red-400
  "#FB923C", // orange-400
  "#FBBF24", // amber-400
  "#FDE047", // yellow-400
  "#BEF264", // lime-400
  "#4ADE80", // green-400
  "#34D399", // emerald-400
  "#2DD4BF", // teal-400
  "#22D3EE", // cyan-400
  "#38BDF8", // sky-400
  "#60A5FA", // blue-400
  "#818CF8", // indigo-400
  "#A78BFA", // violet-400
  "#C084FC", // purple-400
  "#E879F9", // fuchsia-400
  "#F9A8D4", // pink-300
  "#F472B6", // pink-400
  "#FB7185", // rose-400
  "#9CA3AF", // zinc-400
  "#64748B", // slate-400
];

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
