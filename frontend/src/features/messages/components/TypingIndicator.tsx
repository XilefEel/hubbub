export default function TypingIndicator({
  typingNames,
}: {
  typingNames: string[];
}) {
  const count = typingNames.length;
  if (count === 0) return <div className="mb-1 h-4" />;

  let text: string;

  if (count === 1) {
    text = `${typingNames[0]} is typing...`;
  } else if (count === 2) {
    text = `${typingNames[0]} and ${typingNames[1]} are typing...`;
  } else {
    text = `${typingNames[0]}, ${typingNames[1]}, and ${count - 2} others are typing...`;
  }

  return (
    <div className="mb-1 h-4 text-xs text-zinc-400 italic dark:text-zinc-500">
      {text}
    </div>
  );
}
