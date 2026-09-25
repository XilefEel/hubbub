import { useState, type ReactNode } from "react";
import { EmojiPicker } from "frimousse";
import * as Popover from "@radix-ui/react-popover";
import type {
  EmojiPickerListCategoryHeaderProps,
  EmojiPickerListRowProps,
  EmojiPickerListEmojiProps,
} from "frimousse";

export function EmojiPickerPopover({
  onEmojiSelect,
  side = "top",
  align = "end",
  children,
}: {
  onEmojiSelect: (emoji: string) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          side={side}
          align={align}
          className="z-50"
        >
          <EmojiPicker.Root
            onEmojiSelect={({ emoji }) => {
              onEmojiSelect(emoji);
              setOpen(false);
            }}
            className="flex h-90 w-75 flex-col rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            <EmojiPicker.Search
              className="mx-2 mt-2 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-zinc-900 outline-none focus:outline-none dark:border-zinc-700 dark:text-zinc-100"
              placeholder="Search emoji..."
            />

            <EmojiPicker.Viewport className="relative flex-1 outline-none">
              <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                No emoji found.
              </EmojiPicker.Empty>

              <EmojiPicker.List
                className="select-none"
                components={{
                  CategoryHeader: ({
                    category,
                    ...props
                  }: EmojiPickerListCategoryHeaderProps) => (
                    <div
                      className="bg-white px-3 pt-3 pb-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      {...props}
                    >
                      {category.label}
                    </div>
                  ),
                  Row: ({ children, ...props }: EmojiPickerListRowProps) => (
                    <div className="px-2" {...props}>
                      {children}
                    </div>
                  ),
                  Emoji: ({ emoji, ...props }: EmojiPickerListEmojiProps) => (
                    <button
                      className="flex size-8 items-center justify-center rounded-md text-xl transition-colors duration-100 data-active:bg-zinc-50 dark:data-active:bg-zinc-700/50"
                      {...props}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                }}
              />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
