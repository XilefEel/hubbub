import Tooltip from "@/components/ui/Tooltip";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Home } from "lucide-react";

export default function HomeItem({
  active,
  unread,
}: {
  active: boolean;
  unread: number;
}) {
  return (
    <div className="group relative flex w-full justify-center">
      <span
        className={cn(
          "absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-zinc-800 dark:bg-white",
          "transition-[height] duration-100",
          active ? "h-10" : "h-0 group-hover:h-5",
        )}
      />

      <Tooltip content="Home" side="right">
        <Link
          to="/me"
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center",
            "rounded-[50%] transition-[border-radius,background-color] duration-100 hover:rounded-xl",
            active
              ? "rounded-xl bg-teal-500 text-white"
              : "dark:bg-zinc-750 bg-zinc-100 hover:bg-zinc-200 dark:text-white dark:hover:bg-zinc-700",
          )}
        >
          <Home className="size-5 shrink-0" />

          {unread > 0 && (
            <span className="absolute -right-1 -bottom-1 rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>
      </Tooltip>
    </div>
  );
}
