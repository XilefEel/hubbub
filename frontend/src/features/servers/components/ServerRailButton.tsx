import Tooltip from "@/components/ui/Tooltip";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export default function ServerRailButton({
  label,
  Icon,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <Tooltip content={label} side="right">
      <button
        onClick={onClick}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center",
          "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
          "dark:bg-zinc-750 bg-zinc-100 hover:bg-zinc-200 dark:text-white dark:hover:bg-zinc-700",
        )}
      >
        <Icon className="size-5 shrink-0" />
      </button>
    </Tooltip>
  );
}
