import { useCreateChannelModal } from "@/app/modals/useModalStore";
import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Hash, Volume2 } from "lucide-react";
import { cn } from "cn";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import Dialog from "@/components/ui/Dialog";
import { useCurrentMembership } from "@/features/members/hooks/useCurrentMembership";
import { useCreateChannel } from "../hooks/useChannels";

export default function CreateChannelModal() {
  const { isOpen, serverId, closeModal, setIsOpen } = useCreateChannelModal();

  if (!serverId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Create channel">
      <CreateChannelForm
        key={serverId}
        serverId={serverId}
        onSuccess={closeModal}
      />
    </Dialog>
  );
}

function CreateChannelForm({
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
              "hover:bg-zinc-50 data-[state=checked]:bg-zinc-100 dark:hover:bg-zinc-700/50 dark:data-[state=checked]:bg-zinc-700",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Hash className="size-5 shrink-0" />

              <div className="flex flex-col text-left">
                <span className="font-semibold">Text</span>
                <span className="text-xs text-zinc-500">
                  Post images, stickers, opinions, and puns
                </span>
              </div>
            </div>

            <div className="flex size-5 items-center justify-center rounded-full border-2 border-zinc-400 group-data-[state=checked]:border-teal-500">
              <RadioGroup.Indicator className="size-3 rounded-full bg-teal-500" />
            </div>
          </RadioGroup.Item>

          <RadioGroup.Item
            value="voice"
            className={cn(
              "group flex items-center justify-between rounded-lg p-3",
              "hover:bg-zinc-50 data-[state=checked]:bg-zinc-100 dark:hover:bg-zinc-700/50 dark:data-[state=checked]:bg-zinc-700",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Volume2 className="size-5 shrink-0" />

              <div className="flex flex-col text-left">
                <span className="font-semibold">Voice</span>
                <span className="text-xs text-zinc-500">
                  Hang out together with voice, video, and screen share
                </span>
              </div>
            </div>

            <div className="flex size-5 items-center justify-center rounded-full border-2 border-zinc-400 group-data-[state=checked]:border-teal-500">
              <RadioGroup.Indicator className="size-3 rounded-full bg-teal-500" />
            </div>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>

      <div className="flex flex-col gap-2">
        <label>Channel Name</label>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-lg font-bold text-zinc-400 dark:text-zinc-500">
            {type === "text" ? (
              <Hash className="size-4 shrink-0" />
            ) : (
              <Volume2 className="size-4 shrink-0" />
            )}
          </span>

          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Channel"
            className="py-1.5 pr-3 pl-9"
          />
        </div>
      </div>

      {createChannel.isError && (
        <p className="text-sm text-red-500">{createChannel.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton disabled={createChannel.isPending || name.trim() === ""}>
          Create channel
        </SubmitButton>
      </div>
    </form>
  );
}
