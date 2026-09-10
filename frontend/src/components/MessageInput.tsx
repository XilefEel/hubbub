import { useMemo, useRef, useState, useCallback } from "react";
import { ArrowUp, Plus, Upload } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { useFileDrop } from "../hooks/useFileDrop";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function MessageInput({
  onSubmit,
  onTyping,
  isSending,
}: {
  onSubmit: (content: string, file: File | null) => void;
  onTyping: () => void;
  isSending: boolean;
}) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const applyFile = useCallback((selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
  }, []);

  const { isDragging } = useFileDrop({
    onFileDrop: applyFile,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    onSubmit(content, file);
    setContent("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/90 text-teal-500">
          <Upload className="size-8 shrink-0" />
          <span className="text-lg font-medium">Drop file to attach</span>
        </div>
      )}

      {file && (
        <FilePreview
          file={file}
          previewUrl={previewUrl}
          onRemove={handleRemoveFile}
        />
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
          >
            <Plus className="size-5 shrink-0" />
          </button>

          <input
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onTyping();
            }}
            placeholder="Type a message..."
            className="w-full rounded-xl border border-zinc-200 px-12 py-2 outline-none focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSending || content.trim() === ""}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 disabled:opacity-50 disabled:hover:cursor-not-allowed"
          >
            <ArrowUp className="size-5 shrink-0" />
          </button>
        </div>
      </form>
    </>
  );
}
