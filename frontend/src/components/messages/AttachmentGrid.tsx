import { pb } from "../../lib/pocketbase";
import type { Message } from "../../lib/types";

export function AttachmentGrid({ message }: { message: Message }) {
  if (!message.attachments || message.attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {message.attachments.map((filename) => (
        <a
          key={filename}
          href={pb.files.getURL(message, filename)}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-sm overflow-hidden rounded-xl border border-zinc-200"
        >
          <img
            src={pb.files.getURL(message, filename)}
            alt="Attachment"
            loading="lazy"
            className="w-auto object-cover hover:opacity-95"
          />
        </a>
      ))}
    </div>
  );
}
