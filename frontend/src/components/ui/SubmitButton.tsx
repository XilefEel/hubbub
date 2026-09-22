import { cn } from "cn";

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SubmitButton({
  className,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "rounded-lg bg-teal-500 px-3 py-1.5 text-white transition-colors duration-100 hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
