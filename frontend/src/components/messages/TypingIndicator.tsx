import { renderTypingText } from "../../lib/utils";

export function TypingIndicator({ typingNames }: { typingNames: string[] }) {
  return (
    <div className="mb-1 h-4 text-xs text-gray-400 italic dark:text-gray-500">
      {renderTypingText(typingNames)}
    </div>
  );
}
