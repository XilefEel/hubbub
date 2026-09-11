import { Link } from "@tanstack/react-router";
import { useChannels } from "../../hooks/useChannels";
import { Volume2, Hash, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { CreateChannelForm } from "./CreateChannelForm";
import { useCurrentMembership } from "../../hooks/useCurrentMembership";

export function ChannelList({ serverId }: { serverId: string }) {
  const { data: channel, isLoading, error } = useChannels(serverId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { isOwner } = useCurrentMembership(serverId);

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading channels...</p>;

  if (error)
    return <p className="text-sm text-red-500">Failed to load channels</p>;

  return (
    <>
      <div className="flex items-center justify-between text-zinc-500">
        <h2 className="text-sm">Channels</h2>

        {isOwner && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-sm hover:text-teal-500 hover:underline"
          >
            <Plus className="size-3 shrink-0" />
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-1">
        {channel?.map((c) => (
          <li key={c.id} className="flex items-center justify-between text-sm">
            <Link
              to="/servers/$serverId/channels/$channelId"
              params={{ serverId, channelId: c.id }}
              className="flex w-full items-center gap-1 rounded px-2 py-1 hover:bg-zinc-50"
              activeProps={{ className: "bg-zinc-100 font-medium" }}
            >
              {c.type === "voice" ? (
                <Volume2 className="size-4 shrink-0" />
              ) : (
                <Hash className="size-4 shrink-0" />
              )}
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create channel"
      >
        <CreateChannelForm
          serverId={serverId}
          onSuccess={() => setConfirmOpen(false)}
        />
      </Dialog>
    </>
  );
}
