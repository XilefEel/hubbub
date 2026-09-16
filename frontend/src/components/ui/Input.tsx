import { cn } from "cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg px-3 py-1.5 text-sm outline-none focus:outline-none",
        "border border-zinc-200 dark:border-zinc-700",
        "focus-visible:ring-2 focus-visible:ring-teal-500 dark:focus-visible:ring-teal-400",
        className,
      )}
      {...props}
    />
  );
}
