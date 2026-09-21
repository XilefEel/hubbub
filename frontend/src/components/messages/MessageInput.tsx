import { useRef, useState, useCallback, useMemo } from "react";
import { ArrowUp, Plus, Upload, X } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { useFileDrop } from "../../hooks/useFileDrop";
import type { Message, ServerMember, User } from "../../lib/types";
import Tooltip from "../ui/Tooltip";
import { useSendMessage } from "../../hooks/useMessages";
import { cn } from "cn";
import { pb } from "../../lib/pocketbase";
import UserAvatar from "../ui/UserAvatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

export function MessageInput({
  members,
  replyingTo,
  channelId,
  onTyping,
  onCancelReply,
}: {
  members: ServerMember[] | undefined;
  replyingTo: Message | null;
  channelId: string;
  onTyping: () => void;
  onCancelReply: () => void;
}) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<User[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [selectedMention, setSelectedMention] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useSendMessage();

  const applyFiles = useCallback(
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

  const { isDragging } = useFileDrop({ onFileDrop: applyFiles });

  const mentionableMembers = useMemo(
    () =>
      (members ?? [])
        .map((m) => m.expand?.user)
        .filter((u): u is User => !!u && u.id !== pb.authStore.record?.id),
    [members],
  );

  const matchedMentions = useMemo(() => {
    if (query === null) return [];

    return mentionableMembers
      .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [mentionableMembers, query]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) applyFiles(e.target.files);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const pickMention = (user: User) => {
    const input = inputRef.current;
    if (!input) return;

    const value = input.value;
    const cursor = input.selectionStart ?? value.length;
    const before = value.slice(0, cursor).replace(/@\w*$/, `@${user.name} `);
    const after = value.slice(cursor);

    setContent(before + after);
    setMentions((prev) =>
      prev.some((m) => m.id === user.id) ? prev : [...prev, user],
    );
    setQuery(null);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(before.length, before.length);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContent(value);
    onTyping();

    const cursor = e.target.selectionStart ?? value.length;
    const match = value.slice(0, cursor).match(/(?:^|\s)@(\w*)$/);

    setQuery(match ? match[1] : null);
    setSelectedMention(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (query === null || matchedMentions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMention((s) => (s + 1) % matchedMentions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMention(
        (s) => (s - 1 + matchedMentions.length) % matchedMentions.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pickMention(matchedMentions[selectedMention]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    const activeMentions = mentions
      .filter((m) => content.includes(`@${m.name}`))
      .map((m) => m.id);

    sendMessage.mutate(
      {
        content,
        channelId,
        files,
        replyTo: replyingTo?.id,
        mentions: activeMentions,
      },
      { onSuccess: onCancelReply },
    );

    setContent("");
    setFiles([]);
    setMentions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {isDragging && (
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

      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}

      {replyingTo && (
        <div className="flex items-center justify-between rounded-t-xl bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400">
          <span>
            Replying to{" "}
            <span className="font-medium">
              {replyingTo.expand?.user?.name ?? "Unknown"}
            </span>
          </span>

          <button
            onClick={onCancelReply}
            className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
          >
            <X className="size-4 shrink-0" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          <Tooltip content="Attach File">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 disabled:opacity-50 disabled:hover:cursor-not-allowed dark:text-zinc-500 dark:hover:text-zinc-400"
            >
              <Plus className="size-5 shrink-0" />
            </button>
          </Tooltip>

          {matchedMentions.length > 0 && (
            <ul className="absolute bottom-full mb-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {matchedMentions.map((user, i) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickMention(user);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                      i === selectedMention && "bg-zinc-100 dark:bg-zinc-700",
                    )}
                  >
                    <UserAvatar user={user} size="size-5" />
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <input
            autoFocus
            ref={inputRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full rounded-xl border border-zinc-200 px-12 py-2 outline-none focus:outline-none dark:border-zinc-700"
          />

          <button
            type="submit"
            disabled={sendMessage.isPending || content.trim() === ""}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 disabled:opacity-50 disabled:hover:cursor-not-allowed dark:text-zinc-500 dark:hover:text-zinc-400"
          >
            <ArrowUp className="size-5 shrink-0" />
          </button>
        </div>
      </form>
    </>
  );
}
