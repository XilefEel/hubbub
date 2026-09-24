import Skeleton from "@/components/ui/Skeleton";
import { cn } from "cn";

const WIDTHS = ["w-24", "w-32", "w-20", "w-28"];

export default function MemberListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="mb-2 h-3 w-16" />

        <ul className="flex flex-col gap-1">
          {WIDTHS.map((w, i) => (
            <li key={i} className="flex items-center gap-2 px-2 py-1">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className={cn("h-4", w)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
