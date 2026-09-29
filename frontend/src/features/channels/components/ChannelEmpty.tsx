import { Hash } from "lucide-react";

export default function ChannelEmpty({ channelName }: { channelName: string }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-2 pb-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
        <Hash className="size-10 text-zinc-700 dark:text-zinc-200" />
      </div>

      <h1 className="text-3xl font-bold">Welcome to #{channelName}!</h1>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        This is the start of the #{channelName} channel.
      </p>
    </div>
  );
}
