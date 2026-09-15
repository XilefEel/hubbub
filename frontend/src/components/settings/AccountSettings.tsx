import { useRef } from "react";
import { useAuth, useUpdateAvatar } from "../../hooks/useAuth";
import { pb } from "../../lib/pocketbase";

export default function AccountSettings() {
  const { user } = useAuth();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-zinc-900">Account</h3>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="size-16 shrink-0 rounded-full bg-gray-200" />
        )}

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Change avatar
          </button>

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
