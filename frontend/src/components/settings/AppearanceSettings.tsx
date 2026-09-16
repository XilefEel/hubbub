import { Moon, Sun } from "lucide-react";
import { useTheme, useUIActions } from "../../stores/useUIStore";
import { cn } from "cn";

export function AppearanceSettings() {
  const theme = useTheme();
  const { toggleTheme } = useUIActions();

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold">Appearance</h3>

      <div className="flex items-center justify-between">
        <span className="text-sm">Toggle Theme</span>

        <button
          onClick={toggleTheme}
          className={cn(
            "rounded-lg border p-2",
            theme === "dark"
              ? "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
              : "border-zinc-200 text-zinc-900 hover:bg-zinc-50",
          )}
        >
          {theme === "dark" ? (
            <Sun className="size-4 shrink-0" />
          ) : (
            <Moon className="size-4 shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
