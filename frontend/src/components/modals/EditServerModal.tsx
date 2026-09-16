import { useEffect, useRef, useState } from "react";
import { useEditServerModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";
import { useUpdateServer } from "../../hooks/useServers";
import { pb } from "../../lib/pocketbase";

export default function EditServerModal() {
  const { isOpen, server, closeModal } = useEditServerModal();

  const [name, setName] = useState(server?.name || "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateServer = useUpdateServer();

  useEffect(() => {
    if (!iconFile) return;
    const url = URL.createObjectURL(iconFile);
    return () => URL.revokeObjectURL(url);
  }, [iconFile]);

  if (!isOpen || !server) return null;

  const previewUrl = iconFile
    ? URL.createObjectURL(iconFile)
    : !removeIcon && server.icon
      ? pb.files.getURL(server, server.icon, { thumb: "100x100" })
      : null;

  const hasChanges = name !== server.name || iconFile !== null || removeIcon;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateServer.mutate(
      {
        server,
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
      open={isOpen}
      onOpenChange={closeModal}
      width="max-w-2xl"
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
            <div className="size-16 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          )}
          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 dark:border-zinc-700"
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
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-500 dark:border-zinc-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Server name"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 outline-none focus:outline-none dark:border-zinc-700"
          />

          {updateServer.isError && (
            <p className="text-red-500">{updateServer.error.message}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                updateServer.isPending || !hasChanges || name.trim() === ""
              }
              className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
