import { pb } from "./pocketbase";
import type { Message } from "./types";

export function formatMessageDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${day}/${month}/${year}, ${time}`;
}

export function getMessageImageUrl(message: Message) {
  if (!message.attachment) return null;
  return pb.files.getURL(message, message.attachment);
}
