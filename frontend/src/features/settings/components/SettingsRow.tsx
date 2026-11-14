import { cn } from "cn";
import SettingsButton from "./SettingsButton";
import type { LucideIcon } from "lucide-react";

export default function SettingsRow({
  Icon,
  label,
  value,
  onEdit,
  actionLabel = "Edit",
}: {
  Icon: LucideIcon;
  label: string;
  value?: string;
  onEdit?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <Icon className="size-4 shrink-0" />
        {label}
      </label>

      {value && (
        <div className="ml-auto text-sm text-zinc-600 dark:text-zinc-300">
          {value}
        </div>
      )}

      <SettingsButton onClick={onEdit} className={cn(!value && "ml-auto")}>
        {actionLabel}
      </SettingsButton>
    </div>
  );
}
