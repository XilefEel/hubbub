import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateBio } from "@/features/users/hooks/useUserProfile";

export default function BioSection() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const updateBio = useUpdateBio();
  const savedBio = user?.bio ?? "";

  const displayValue = isEditing || updateBio.isPending ? bioDraft : savedBio;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setBioDraft(savedBio);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    window.getSelection()?.removeAllRanges();

    if (!cancelledRef.current && bioDraft !== savedBio) {
      updateBio.mutate(bioDraft);
    }
    cancelledRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();

    if (e.key === "Escape") {
      cancelledRef.current = true;
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-2 text-sm">
        <Quote className="size-4 shrink-0" />
        About Me
      </span>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {isEditing
          ? "Click outside or press Enter to save"
          : "Double click to edit your bio."}
      </p>

      <div
        onDoubleClick={handleDoubleClick}
        className={cn(
          "mt-1 ml-0.5 cursor-text rounded-lg transition-all",
          isEditing
            ? "px-3 shadow-sm ring ring-teal-500"
            : "text-zinc-600 hover:opacity-80 dark:text-zinc-300 dark:hover:opacity-80",
        )}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-5 w-full bg-transparent text-sm focus:outline-none"
          />
        ) : (
          <p
            className={cn(
              "h-6 truncate text-sm select-none",
              !displayValue && "text-zinc-400",
            )}
          >
            {displayValue || "No bio yet."}
          </p>
        )}
      </div>
    </div>
  );
}
