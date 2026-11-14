import Tooltip from "@/components/ui/Tooltip";
import { StickerPopover } from "@/features/stickers/components/StickerPopover";
import { Sticker } from "lucide-react";

export default function StickerButton({
  handleStickerSelect,
}: {
  handleStickerSelect: (stickerId: string) => void;
}) {
  return (
    <div className="absolute top-1/2 right-20 z-10 -translate-y-1/2">
      <StickerPopover onSend={handleStickerSelect}>
        <div>
          <Tooltip content="Send Sticker" side="top">
            <button
              type="button"
              className="block text-zinc-400 transition-colors duration-100 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400"
            >
              <Sticker className="size-5 shrink-0" />
            </button>
          </Tooltip>
        </div>
      </StickerPopover>
    </div>
  );
}
