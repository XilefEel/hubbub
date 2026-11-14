import { EmojiPickerPopover } from "@/components/ui/EmojiPickerPopover";
import Tooltip from "@/components/ui/Tooltip";
import { FaceSlightlySmiling } from "lucide-react";

export default function EmojiButton({
  addEmoji,
}: {
  addEmoji: (content: string) => void;
}) {
  return (
    <EmojiPickerPopover onEmojiSelect={addEmoji}>
      <div className="absolute top-1/2 right-12 z-10 -translate-y-1/2">
        <Tooltip content="Add emoji" side="top">
          <button
            type="button"
            className="block text-zinc-400 transition-colors duration-100 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400"
          >
            <FaceSlightlySmiling className="size-5 shrink-0" />
          </button>
        </Tooltip>
      </div>
    </EmojiPickerPopover>
  );
}
