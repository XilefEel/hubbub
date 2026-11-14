import { cn } from "cn";

type SettingsButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SettingsButton({
  className,
  ...props
}: SettingsButtonProps) {
  return (
    <button
      className={cn(
        "dark:hover:bg-zinc-750 rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700",
        className,
      )}
      {...props}
    />
  );
}
