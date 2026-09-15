import { X } from "lucide-react";
import { useMemo } from "react";

export function FilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="mb-2 flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-2 text-xs dark:border-zinc-700">
      <img
        src={previewUrl || ""}
        alt="Upload preview"
        className="size-12 rounded border border-zinc-200 object-cover dark:border-zinc-700"
      />

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-zinc-700 dark:text-zinc-200">
          {file.name}
        </span>

        <span className="text-zinc-400 dark:text-zinc-500">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
      >
        <X className="size-4 shrink-0" />
      </button>
    </div>
  );
}
