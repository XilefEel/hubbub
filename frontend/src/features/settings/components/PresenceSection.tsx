import { Circle } from "lucide-react";
import { cn } from "cn";
import {
  useMyPresenceStatus,
  useSetPresenceStatus,
} from "@/features/members/hooks/usePresence";
import Select from "@/components/ui/Select";
import type { PresenceStatus } from "@/lib/types";

const OPTIONS: { value: PresenceStatus; label: string; dot: string }[] = [
  { value: "online", label: "Online", dot: "bg-green-500" },
  { value: "dnd", label: "Do Not Disturb", dot: "bg-yellow-500" },
  { value: "invisible", label: "Invisible", dot: "bg-zinc-400" },
];

function presenceDescription(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "Others can see when you're online.";
    case "dnd":
      return "You won’t get notification sounds or popups.";
    case "invisible":
      return "You appear offline to everyone else.";
  }
}

export default function PresenceSection() {
  const status = useMyPresenceStatus();
  const setStatus = useSetPresenceStatus();

  const current = OPTIONS.find((o) => o.value === status) ?? OPTIONS[0];

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm">
          <Circle className="size-4 shrink-0" />
          Status
        </span>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {presenceDescription(current.value)}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className={cn("size-2.5 rounded-full", current.dot)} />

        <Select
          value={status}
          onValueChange={(v) => setStatus.mutate(v)}
          options={OPTIONS}
          disabled={setStatus.isPending}
          className="w-40"
        />
      </div>
    </div>
  );
}
