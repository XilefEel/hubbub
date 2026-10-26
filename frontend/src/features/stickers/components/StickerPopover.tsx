import { useRef } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import {
  useMyStickers,
  useCreateSticker,
  useRemoveSticker,
} from "../hooks/useStickers";
import Popover from "@/components/ui/Popover";
import { cn } from "cn";

export function StickerPopover({
  onSend,
  children,
}: {
  onSend: (stickerId: string) => void;
  children: React.ReactNode;
}) {
  const { data: myStickers } = useMyStickers();
  const createSticker = useCreateSticker();
  const removeSticker = useRemoveSticker();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    createSticker.mutate({ file });
  };

  return (
    <Popover
      side="top"
      align="end"
      width="w-80"
      padding="p-2"
      trigger={children}
      content={
        <>
          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={createSticker.isPending}
              className={cn(
                "flex aspect-square w-full items-center justify-center rounded-md transition-colors duration-100",
                "dark:hover:bg-zinc-750 hover:bg-zinc-100",
                "border-2 border-dashed border-zinc-300 dark:border-zinc-600",
                "text-zinc-500",
              )}
            >
              {createSticker.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              hidden
            />

            {myStickers?.map((ms) => {
              const sticker = ms.expand?.sticker;
              if (!sticker) return null;

              return (
                <div key={ms.id} className="group relative aspect-square">
                  <button
                    type="button"
                    onClick={() => onSend(sticker.id)}
                    className="block size-full rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <img
                      src={pb.files.getURL(sticker, sticker.file, {
                        thumb: "256x256",
                      })}
                      alt="sticker"
                      loading="lazy"
                      className="size-full rounded-md object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    aria-label="Remove sticker"
                    onClick={() => removeSticker.mutate(ms.id)}
                    className="absolute -top-1 -right-1 rounded-full bg-zinc-900/80 p-0.5 text-white opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {myStickers?.length === 0 && (
            <p className="px-3 pb-3 text-center text-xs text-zinc-500">
              No stickers yet. Upload an image or save one from chat.
            </p>
          )}
        </>
      }
    />
  );
}
