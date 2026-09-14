import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";
import { useCreateChannel } from "../../hooks/useChannels";
import { Hash, Volume2 } from "lucide-react";
import { cn } from "cn";

export function CreateChannelForm({
  serverId,
  onSuccess,
}: {
  serverId: string;
  onSuccess?: () => void;
}) {
  const { isOwner } = useCurrentMembership(serverId);

  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");

  const createChannel = useCreateChannel(serverId);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    createChannel.mutate(
      { name, type },
      {
        onSuccess: () => {
          setName("");
          onSuccess?.();
        },
      },
    );
  };

  if (!isOwner) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <label>Channel Type</label>

        <RadioGroup.Root
          value={type}
          onValueChange={(value) => setType(value as "text" | "voice")}
          className="flex flex-col gap-2"
        >
          <RadioGroup.Item
            value="text"
            className={cn(
              "group flex items-center justify-between rounded-lg p-3",
              "hover:bg-gray-50 data-[state=checked]:bg-zinc-100",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Hash className="size-5 shrink-0" />

              <div className="flex flex-col text-left">
                <span className="font-semibold">Text</span>
                <span className="text-xs text-gray-500">
                  Post images, stickers, opinions, and puns
                </span>
              </div>
            </div>

            <div className="flex size-5 items-center justify-center rounded-full border-2 border-gray-400 group-data-[state=checked]:border-teal-500">
              <RadioGroup.Indicator className="size-3 rounded-full bg-teal-500" />
            </div>
          </RadioGroup.Item>

          <RadioGroup.Item
            value="voice"
            className={cn(
              "group flex items-center justify-between rounded-lg p-3",
              "hover:bg-gray-50 data-[state=checked]:bg-zinc-100",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Volume2 className="size-5 shrink-0" />

              <div className="flex flex-col text-left">
                <span className="font-semibold">Voice</span>
                <span className="text-xs text-gray-500">
                  Hang out together with voice, video, and screen share
                </span>
              </div>
            </div>

            <div className="flex size-5 items-center justify-center rounded-full border-2 border-gray-400 group-data-[state=checked]:border-teal-500">
              <RadioGroup.Indicator className="size-3 rounded-full bg-teal-500" />
            </div>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>

      <div className="flex flex-col gap-2">
        <label>Channel Name</label>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-lg font-bold text-gray-400">
            {type === "text" ? (
              <Hash className="size-4 shrink-0" />
            ) : (
              <Volume2 className="size-4 shrink-0" />
            )}
          </span>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Channel"
            className="w-full rounded-lg border border-gray-200 py-1.5 pr-3 pl-9 text-sm outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          />
        </div>
      </div>

      {createChannel.isError && (
        <p className="text-sm text-red-500">{createChannel.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={createChannel.isPending || name.trim() === ""}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
        >
          Create channel
        </button>
      </div>
    </form>
  );
}
