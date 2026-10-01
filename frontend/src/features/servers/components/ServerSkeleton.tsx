import Skeleton from "@/components/ui/Skeleton";

export default function ServerSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="size-10 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}
