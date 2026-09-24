import Skeleton from "@/components/ui/Skeleton";
import { cn } from "cn";

const WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16"];

export default function ChannelListSkeleton() {
  return (
    <ul className="flex flex-col gap-1">
      {WIDTHS.map((w, i) => (
        <li key={i} className="flex items-center gap-1 px-2 py-1">
          <Skeleton className="size-5 shrink-0" />
          <Skeleton className={cn("h-5", w)} />
        </li>
      ))}
    </ul>
  );
}
