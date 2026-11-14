import { useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import { useCreateServer, useUpdateServer } from "../hooks/useServers";
import { pb } from "@/lib/pocketbase";
import type { Server } from "@/lib/types";
import { useServerModal } from "./useServerModal";

export default function ServerModal() {
  const { isOpen, server, closeModal, setIsOpen } = useServerModal();

  return (
    <Dialog
      title={server ? "Edit server" : "Create server"}
      open={isOpen}
      onOpenChange={setIsOpen}
      width="max-w-xl"
    >
      <ServerForm
        key={server?.id ?? "create"}
        server={server}
        closeModal={closeModal}
      />
    </Dialog>
  );
}

function ServerForm({
  server,
  closeModal,
}: {
  server: Server | null;
  closeModal: () => void;
}) {
  const isEdit = server !== null;

  const [name, setName] = useState(server?.name ?? "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createServer = useCreateServer();
  const updateServer = useUpdateServer();
  const mutation = isEdit ? updateServer : createServer;

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
    (server && !removeIcon && server.icon
      ? pb.files.getURL(server, server.icon, { thumb: "100x100" })
      : null);

  const hasChanges = isEdit
    ? name !== server.name || iconFile !== null || removeIcon
    : true;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateServer.mutate(
        {
          serverId: server.id,
          name: name !== server.name ? name : undefined,
          icon: iconFile ?? (removeIcon ? "" : undefined),
        },
        { onSuccess: closeModal },
      );
    } else {
      createServer.mutate(
        { name, icon: iconFile ?? undefined },
        { onSuccess: closeModal },
      );
    }
  };

  return (
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
              disabled={mutation.isPending}
              className="dark:hover:bg-zinc-750 rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700"
            >
              {previewUrl ? "Change icon" : "Upload icon"}
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setIconFile(null);
                  setRemoveIcon(true);
                }}
                disabled={mutation.isPending}
                className="dark:hover:bg-zinc-750 rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700"
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

        {mutation.isError && (
          <p className="text-red-500">{mutation.error.message}</p>
        )}

        <div className="flex justify-end">
          <SubmitButton
            disabled={mutation.isPending || !hasChanges || name.trim() === ""}
          >
            {isEdit ? "Save" : "Create server"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
