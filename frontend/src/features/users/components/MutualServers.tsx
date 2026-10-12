import { useMutualServers } from "@/features/servers/hooks/useServers";
import { pb } from "@/lib/pocketbase";

export default function MutualServers({ userId }: { userId: string }) {
  const servers = useMutualServers(userId);

  if (servers.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
        Mutual Servers — {servers.length}
      </h3>

      <ul className="flex flex-col gap-1">
        {servers.map((server) => (
          <li key={server.id} className="flex items-center gap-2 text-sm">
            {server.icon ? (
              <img
                src={pb.files.getURL(server, server.icon, {
                  thumb: "100x100",
                })}
                alt="server icon"
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {server.name.slice(0, 2).toUpperCase()}
              </span>
            )}

            <span className="truncate">{server.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
