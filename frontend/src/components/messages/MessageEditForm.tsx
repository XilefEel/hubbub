export function MessageEditForm({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        disabled={disabled}
        className="flex-1 rounded border border-zinc-300 px-2 py-0.5 text-sm outline-none focus:border-zinc-500"
      />
    </form>
  );
}
