export default function UnreadDivider() {
  return (
    <div className="my-2 flex items-center gap-2 px-4">
      <div className="h-px flex-1 bg-red-500/60" />
      <span className="text-xs font-semibold text-red-500">New</span>
      <div className="h-px flex-1 bg-red-500/60" />
    </div>
  );
}
