import { Trash2 } from "lucide-react";

export default function DeleteAccountSection() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
        <Trash2 className="size-4 shrink-0" />
        Delete Account
      </span>

      <button className="ml-auto w-18 rounded-md bg-red-500 py-1.5 text-sm text-white transition-colors duration-100 hover:bg-red-600">
        Delete
      </button>
    </div>
  );
}
