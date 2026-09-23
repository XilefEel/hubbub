import { renderTypingText } from "@/lib/utils";

export default function TypingIndicator({
  typingNames,
}: {
  typingNames: string[];
}) {
  return (
    <div className="mb-1 h-4 text-xs text-zinc-400 italic dark:text-zinc-500">
      {renderTypingText(typingNames)}
    </div>
  );
}
