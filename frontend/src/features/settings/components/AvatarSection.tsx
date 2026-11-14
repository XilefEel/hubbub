import { useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useRemoveAvatar,
  useUpdateAvatar,
} from "@/features/users/hooks/useUserProfile";
import UserAvatar from "@/features/users/components/UserAvatar";
import SettingsButton from "./SettingsButton";

export default function AvatarSection() {
  const { user } = useAuth();

  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = updateAvatar.isPending || removeAvatar.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateAvatar.mutate(file);
    e.target.value = "";
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <UserAvatar user={user} size="size-16" />

      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <div className="flex gap-2">
          <SettingsButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            {updateAvatar.isPending ? "Uploading..." : "Change avatar"}
          </SettingsButton>

          {user.avatar && (
            <SettingsButton
              onClick={() => removeAvatar.mutate()}
              disabled={isPending}
            >
              {removeAvatar.isPending ? "Removing..." : "Remove"}
            </SettingsButton>
          )}
        </div>

        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          JPG, PNG or GIF. Max 5MB.
        </p>
      </div>
    </div>
  );
}
