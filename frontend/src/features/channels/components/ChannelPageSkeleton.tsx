import Skeleton from "@/components/ui/Skeleton";
import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";

export default function ChannelPageSkeleton() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4">
      <div className="flex items-center gap-2 pb-4">
        <Skeleton className="size-7" />
        <Skeleton className="h-7 w-32" />
      </div>

      <MessagesSkeleton />

      <Skeleton className="h-10 rounded-lg" />
    </div>
  );
}
