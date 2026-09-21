import { useRef } from "react";
import {
  useAuth,
  useRemoveAvatar,
  useUpdateAvatar,
} from "../../auth/hooks/useAuth";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  useChangePasswordModal,
  useUpdateUsernameModal,
} from "@/app/modals/useModalStore";

export default function AccountSettings() {
  const { user } = useAuth();
  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openModal: openUpdateUsername } = useUpdateUsernameModal();
  const { openModal: openChangePassword } = useChangePasswordModal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
  };

  const isPending = updateAvatar.isPending || removeAvatar.isPending;

  return (
    <div className="flex flex-col gap-6">
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
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
            >
              {updateAvatar.isPending ? "Uploading..." : "Change avatar"}
            </button>

            {user?.avatar && (
              <button
                onClick={() => removeAvatar.mutate()}
                disabled={isPending}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
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
          className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm">Email</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600 dark:text-zinc-300">
          {user?.email}
        </div>
        <button className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm">Password</span>
        <button
          onClick={openChangePassword}
          className="ml-auto w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
        >
          Edit
        </button>
      </div>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm">Delete Account</span>
        <button className="ml-auto w-18 rounded-md bg-red-500 py-1.5 text-sm text-white hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
