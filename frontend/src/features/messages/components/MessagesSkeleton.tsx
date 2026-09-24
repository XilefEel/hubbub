import Skeleton from "@/components/ui/Skeleton";
import { cn } from "cn";

const ROWS = [
  { name: "w-24", lines: ["w-3/4"] },
  { name: "w-32", lines: ["w-full", "w-2/3"] },
  { name: "w-20", lines: ["w-1/2"] },
  { name: "w-28", lines: ["w-5/6", "w-1/3"] },
  { name: "w-24", lines: ["w-2/3"] },
  { name: "w-32", lines: ["w-full", "w-1/2"] },
  { name: "w-20", lines: ["w-3/4"] },
  { name: "w-28", lines: ["w-1/2", "w-5/6"] },
  { name: "w-24", lines: ["w-full"] },
];

export default function MessagesSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      {ROWS.map((row, i) => (
        <div key={i} className="flex animate-pulse items-start gap-4 px-2 py-1">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className={cn("h-3", row.name)} />

            {row.lines.map((w, j) => (
              <Skeleton key={j} className={cn("h-3", w)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
