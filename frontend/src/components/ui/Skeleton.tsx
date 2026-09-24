import { cn } from "cn";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-zinc-100 dark:bg-zinc-700",
        className,
      )}
      aria-hidden="true"
    />
  );
}
