import { useRef } from "react";
import { pb } from "@/lib/pocketbase";
import type { Sticker } from "@/lib/types";

export function StickerMessage({ sticker }: { sticker: Sticker | undefined }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!sticker) {
    return <p className="text-sm text-zinc-500 italic">Sticker removed</p>;
  }

  const thumb = pb.files.getURL(sticker, sticker.file, { thumb: "512x512" });
  const full = pb.files.getURL(sticker, sticker.file);

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

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
        <img
          src={full}
          alt="sticker"
          onClick={closeDialog}
          className="max-h-[60vh] max-w-sm cursor-zoom-out rounded-xl border border-zinc-700 bg-zinc-900 object-contain p-2 shadow-2xl"
        />
      </dialog>
    </>
  );
}
