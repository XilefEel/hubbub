function renderTypingText(typingNames: string[]) {
  if (typingNames.length === 0) return "";
  if (typingNames.length === 1) return `${typingNames[0]} is typing...`;
  if (typingNames.length === 2)
    return `${typingNames[0]} and ${typingNames[1]} are typing...`;

  return `${typingNames[0]}, ${typingNames[1]}, and ${
    typingNames.length - 2
  } others are typing...`;
}

export function TypingIndicator({ typingNames }: { typingNames: string[] }) {
  return (
    <div className="mb-1 h-4 text-xs text-gray-400 italic">
      {renderTypingText(typingNames)}
    </div>
  );
}
