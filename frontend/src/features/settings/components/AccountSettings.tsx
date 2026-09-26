import { useRef, useState } from "react";
import {
  useAuth,
  useRemoveAvatar,
  useUpdateAvatar,
  useUpdateBio,
} from "../../auth/hooks/useAuth";
import UserAvatar from "@/features/users/components/UserAvatar";
import {
  useChangePasswordModal,
  useUpdateUsernameModal,
} from "@/app/modals/useModalStore";
import { cn } from "cn";

export default function AccountSettings() {
  const { user } = useAuth();

  const { openModal: openUpdateUsername } = useUpdateUsernameModal();
  const { openModal: openChangePassword } = useChangePasswordModal();

  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
  };

  const isPending = updateAvatar.isPending || removeAvatar.isPending;

  const [bioDraft, setBioDraft] = useState(user?.bio ?? "");
  const updateBio = useUpdateBio();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (bioDraft !== user?.bio) updateBio.mutate(bioDraft);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();

    if (e.key === "Escape") {
      setBioDraft(user?.bio ?? "");
      e.currentTarget.blur();
    }
  };

  return (
    <div
      style={{ scrollbarGutter: "stable" }}
      className="flex flex-col gap-6 overflow-y-auto"
    >
      <h3 className="font-semibold">Account</h3>

      <div className="flex items-center gap-4">
        <UserAvatar user={user!} size="size-16" />

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
            >
              {updateAvatar.isPending ? "Uploading..." : "Change avatar"}
            </button>

            {user?.avatar && (
              <button
                onClick={() => removeAvatar.mutate()}
                disabled={isPending}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
              >
                {removeAvatar.isPending ? "Removing..." : "Remove"}
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm">Username</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600 dark:text-zinc-300">
          {user?.name}
        </div>
        <button
          onClick={openUpdateUsername}
          className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm">Email</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600 dark:text-zinc-300">
          {user?.email}
        </div>
        <button className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm">Password</span>
        <button
          onClick={openChangePassword}
          className="ml-auto w-18 rounded-md border border-zinc-200 py-1.5 text-sm transition-colors duration-100 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Edit
        </button>
      </div>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

      <div className="flex flex-col gap-2">
        <label className="mb-1 block text-sm">About Me</label>

        <div
          onDoubleClick={handleDoubleClick}
          className={cn(
            "ml-0.5 cursor-text rounded-lg transition-all",
            isEditing
              ? "px-3 shadow-sm ring ring-teal-500"
              : "text-zinc-500 hover:opacity-80 dark:text-zinc-400",
          )}
        >
          <input
            ref={inputRef}
            placeholder="None"
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing}
            className={cn(
              "truncate bg-transparent text-sm focus:outline-none",
              !isEditing && "pointer-events-none",
            )}
          />
        </div>
      </div>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm">Delete Account</span>
        <button className="ml-auto w-18 rounded-md bg-red-500 py-1.5 text-sm text-white transition-colors duration-100 hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
