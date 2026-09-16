import { useEffect, useMemo, useRef, useState } from "react";
import { useEditServerModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";
import { useUpdateServer } from "../../hooks/useServers";
import { pb } from "../../lib/pocketbase";
import type { Server } from "../../lib/types";
import { Input } from "../ui/Input";
import { SubmitButton } from "../ui/SubmitButton";

export default function EditServerModal() {
  const { isOpen, server, closeModal } = useEditServerModal();

  if (!isOpen || !server) return null;

  return (
    <EditServerModalContent
      key={server.id}
      server={server}
      closeModal={closeModal}
    />
  );
}

function EditServerModalContent({
  server,
  closeModal,
}: {
  server: Server;
  closeModal: () => void;
}) {
  const [name, setName] = useState(server.name);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateServer = useUpdateServer();

  const objectUrl = useMemo(
    () => (iconFile ? URL.createObjectURL(iconFile) : null),
    [iconFile],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl =
    objectUrl ??
    (!removeIcon && server.icon
      ? pb.files.getURL(server, server.icon, { thumb: "100x100" })
      : null);

  const hasChanges = name !== server.name || iconFile !== null || removeIcon;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateServer.mutate(
      {
        serverId: server.id,
        name: name !== server.name ? name : undefined,
        icon: iconFile ?? (removeIcon ? "" : undefined),
      },
      {
        onSuccess: () => {
          setIconFile(null);
          setRemoveIcon(false);
          closeModal();
        },
      },
    );
  };

  return (
    <Dialog
      title="Edit Server"
      open={true}
      onOpenChange={closeModal}
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Server icon"
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-700">
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIconFile(file);
                  setRemoveIcon(false);
                }
              }}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={updateServer.isPending}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
              >
                Change icon
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setIconFile(null);
                    setRemoveIcon(true);
                  }}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Server name"
          />

          {updateServer.isError && (
            <p className="text-red-500">{updateServer.error.message}</p>
          )}

          <div className="flex justify-end">
            <SubmitButton
              disabled={
                updateServer.isPending || !hasChanges || name.trim() === ""
              }
            >
              Save
            </SubmitButton>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
