import { useRef } from "react";
import { Heart } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import type { Sticker } from "@/lib/types";
import { cn } from "cn";
import { useStickerFavorite } from "../hooks/useStickerFavorite";

export function StickerMessage({ sticker }: { sticker: Sticker | undefined }) {
  const { isSaved, isPending, toggle } = useStickerFavorite(sticker?.id);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  if (!sticker) {
    return <p className="text-sm text-zinc-500 italic">Sticker removed</p>;
  }

  const thumb = pb.files.getURL(sticker, sticker.file, { thumb: "512x512" });
  const full = pb.files.getURL(sticker, sticker.file);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="block size-40 cursor-zoom-in"
      >
        <img
          src={thumb}
          alt="sticker"
          loading="lazy"
          className="block size-full rounded-md object-cover transition-opacity duration-100 hover:opacity-80"
        />
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
        className="m-auto bg-transparent backdrop:bg-black/30 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          <img
            src={full}
            alt="sticker"
            onClick={closeDialog}
            className="max-h-[60vh] max-w-[80vw] cursor-zoom-out rounded-lg object-contain sm:max-w-sm"
          />

          <button
            type="button"
            disabled={isPending}
            onClick={toggle}
            aria-pressed={isSaved}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-100 disabled:opacity-50",
              isSaved
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                : "dark:hover:bg-zinc-750 border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            )}
          >
            <Heart className={cn("size-4", isSaved && "fill-current")} />
            {isSaved ? "Saved" : "Add to favorites"}
          </button>
        </div>
      </dialog>
    </>
  );
}
