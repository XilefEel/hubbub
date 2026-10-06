import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { cn } from "cn";
import { Check } from "lucide-react";

export default function Checkbox(
  props: React.ComponentProps<typeof RadixCheckbox.Root>,
) {
  return (
    <RadixCheckbox.Root
      {...props}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded transition-colors",
        "bg-white dark:bg-zinc-800",
        "border border-zinc-200 dark:border-zinc-700",
        "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none",
        "data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500",
      )}
    >
      <RadixCheckbox.Indicator>
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
