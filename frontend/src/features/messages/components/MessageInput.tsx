import { useState, useRef } from "react";
import { ArrowUp, Upload } from "lucide-react";
import type {
  ConversationMember,
  Message,
  MessageScope,
  ServerMember,
} from "@/lib/types";
import { useSendMessage } from "../hooks/useMessages";
import { cn } from "cn";
import ReplyBanner from "./ReplyBanner";
import AttachmentPreview from "./AttachmentPreview";
import { useAttachments } from "../hooks/useAttachments";
import { useMentions } from "../hooks/useMentions";
import MentionSuggestions from "./MentionSuggestions";
import AttachmentButton from "./AttachmentButton";
import StickerButton from "./StickerButton";
import EmojiButton from "./EmojiButton";
import HighlightedText from "./HighlightedText";

export default function MessageInput({
  members,
  replyingTo,
  scope,
  onTyping,
  onCancelReply,
}: {
  members: ServerMember[] | ConversationMember[] | undefined;
  replyingTo: Message | null;
  scope: MessageScope;
  onTyping: () => void;
  onCancelReply: () => void;
}) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const attachments = useAttachments();

  const mentions = useMentions({
    members,
    content,
    setContent,
    inputRef,
  });

  const sendMessage = useSendMessage();

  const canSend = content.trim().length > 0 || attachments.files.length > 0;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSend || sendMessage.isPending) return;

    sendMessage.mutate(
      {
        content,
        scope,
        files: attachments.files,
        replyTo: replyingTo?.id,
        mentions: mentions.userIds,
      },
      { onSuccess: onCancelReply },
    );

    setContent("");
    attachments.clear();
    mentions.reset();
  };

  const handleStickerSelect = (stickerId: string) => {
    if (sendMessage.isPending) return;

    sendMessage.mutate(
      {
        content: "",
        scope,
        files: [],
        replyTo: replyingTo?.id,
        mentions: [],
        stickerId,
      },
      { onSuccess: onCancelReply },
    );
  };

  return (
    <div>
      {attachments.isDragging && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 rounded-2xl text-teal-500",
            "border-2 border-dashed border-teal-400 dark:border-teal-500",
            "bg-teal-50/90 dark:bg-teal-900",
          )}
        >
          <Upload className="size-8 shrink-0" />
          <span className="text-lg font-medium">Drop file to attach</span>
        </div>
      )}

      {attachments.files.length > 0 && (
        <AttachmentPreview
          files={attachments.files}
          handleRemoveFile={attachments.remove}
        />
      )}

      {replyingTo && (
        <ReplyBanner replyingTo={replyingTo} onCancelReply={onCancelReply} />
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <AttachmentButton onFiles={attachments.add} />

          {mentions.matched.length > 0 && (
            <MentionSuggestions
              mentions={mentions.matched}
              selectedIndex={mentions.selected}
              handleSelectMention={mentions.pick}
            />
          )}

          <div className="relative">
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden rounded-xl py-2 pr-28 pl-12 whitespace-pre",
                "border border-transparent",
                "text-zinc-900 dark:text-zinc-100",
              )}
            >
              <HighlightedText content={content} mentions={mentions.users} />
            </div>

            <input
              autoFocus
              ref={inputRef}
              value={content}
              onKeyDown={mentions.onKeyDown}
              onChange={(e) => {
                setContent(e.target.value);
                onTyping();
                mentions.updateQuery(e);
              }}
              onScroll={(e) => {
                if (backdropRef.current)
                  backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
              }}
              placeholder="Type a message..."

              className={cn(
                "relative w-full rounded-xl py-2 pr-28 pl-12",
                "bg-transparent text-transparent outline-none focus:outline-none",
                "border border-zinc-200 dark:border-zinc-700",
                "caret-zinc-900 dark:caret-zinc-100",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              )}
            />
          </div>

          <StickerButton handleStickerSelect={handleStickerSelect} />

          <EmojiButton
            addEmoji={(emoji) => setContent((prev) => prev + emoji)}
          />

          <button
            type="submit"
            disabled={sendMessage.isPending || !canSend}
            className={cn(
              "absolute top-1/2 right-4 -translate-y-1/2 transition-colors duration-100",
              "text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400",
              "disabled:opacity-50 disabled:hover:cursor-not-allowed",
            )}
          >
            <ArrowUp className="size-5 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
}
