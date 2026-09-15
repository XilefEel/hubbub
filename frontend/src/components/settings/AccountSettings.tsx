import { useAuth } from "../../hooks/useAuth";

export default function AccountSettings() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-zinc-900">Account</h3>

      <div className="flex items-center gap-4">
        <div className="size-16 shrink-0 rounded-full bg-zinc-200" />
        <div>
          <button className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
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
        <button className="rounded-md border border-zinc-200 px-6 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="mb-1 block text-sm text-zinc-900">Email</label>
        <div className="ml-auto rounded-md text-sm text-zinc-600">
          {user?.email}
        </div>
        <button className="rounded-md border border-zinc-200 px-6 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm text-zinc-900">Password</span>
        <button className="ml-auto rounded-md border border-zinc-200 px-6 py-1.5 text-sm hover:bg-zinc-50">
          Edit
        </button>
      </div>

      <div className="w-full border-t border-zinc-200" />

      <div className="flex items-center gap-4">
        <span className="mb-1 block text-sm text-zinc-900">Delete Account</span>
        <button className="ml-auto rounded-md bg-red-500 px-6 py-1.5 text-sm text-white hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
