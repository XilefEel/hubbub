import { useState, useCallback } from "react";
import { useFileDrop } from "./useFileDrop";
import { MAX_FILE_SIZE, MAX_FILES } from "@/lib/constants";

export function useAttachments() {
  const [files, setFiles] = useState<File[]>([]);

  const add = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      const validFiles: File[] = [];

      for (const f of incomingArray) {
        if (f.size > MAX_FILE_SIZE) {
          alert(`${f.name} is too large. Maximum size is 5MB.`);
        } else {
          validFiles.push(f);
        }
      }

      if (validFiles.length === 0) return;

      const availableSlots = MAX_FILES - files.length;

      if (availableSlots <= 0) {
        alert(`You can only attach up to ${MAX_FILES} files.`);
        return;
      }

      if (validFiles.length > availableSlots) {
        alert(`You can only attach up to ${MAX_FILES} files.`);
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      setFiles((prev) => [...prev, ...filesToAdd]);
    },
    [files],
  );

  const { isDragging } = useFileDrop({ onFileDrop: add });

  const remove = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const clear = () => setFiles([]);

  return {
    files,
    isDragging,
    add,
    remove,
    clear,
  };
}
