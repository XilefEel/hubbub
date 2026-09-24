import MessagesSkeleton from "@/features/messages/components/MessagesSkeleton";

export default function ChannelPageSkeleton() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4">
      <div className="flex animate-pulse items-center gap-2 pb-4">
        <div className="size-7 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-7 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <MessagesSkeleton />

      <div className="h-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}
