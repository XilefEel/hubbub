import { pb } from "@/lib/pocketbase";
import type { Sticker } from "@/lib/types";

export function StickerMessage({ sticker }: { sticker: Sticker | undefined }) {
  if (!sticker) {
    return <p className="text-sm text-zinc-500 italic">Sticker removed</p>;
  }

  return (
    <div className="group relative size-40">
      <img
        src={pb.files.getURL(sticker, sticker.file, { thumb: "512x512" })}
        alt="sticker"
        loading="lazy"
        className="block size-full rounded-md object-cover"
      />
    </div>
  );
}
