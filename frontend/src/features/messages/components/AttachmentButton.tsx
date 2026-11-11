import { useRef } from "react";
import { Plus } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

export default function AttachButton({
  onFiles,
}: {
  onFiles: (files: FileList) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Tooltip content="Attach File">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 transition-colors duration-100 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400"
        >
          <Plus className="size-5 shrink-0" />
        </button>
      </Tooltip>
    </>
  );
}
