import { useRef } from "react";
import { useAuth, useRemoveAvatar, useUpdateAvatar } from "../../hooks/useAuth";
import { pb } from "../../lib/pocketbase";
import UserAvatar from "../ui/UserAvatar";

export default function AccountSettings() {
  const { user } = useAuth();
  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
  };

  const isPending = updateAvatar.isPending || removeAvatar.isPending;

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-zinc-900">Account</h3>

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
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
            >
              {updateAvatar.isPending ? "Uploading..." : "Change avatar"}
            </button>

            {avatarUrl && (
              <button
                onClick={() => removeAvatar.mutate()}
                disabled={isPending}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
              >
                {removeAvatar.isPending ? "Removing..." : "Remove"}
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm text-zinc-900">Username</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600">
          {user?.name}
        </div>
        <button className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm text-zinc-900">Email</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600">
          {user?.email}
        </div>
        <button className="w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm text-zinc-900">Password</span>
        <button className="ml-auto w-18 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="w-full border-t border-zinc-200" />

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm text-zinc-900">Delete Account</span>
        <button className="ml-auto w-18 rounded-md bg-red-500 py-1.5 text-sm text-white hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
