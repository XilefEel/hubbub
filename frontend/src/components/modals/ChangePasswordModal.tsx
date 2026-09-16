import { useState } from "react";
import { useChangePasswordModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";
import { useChangePassword } from "../../hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

export default function ChangePasswordModal() {
  const { isOpen, closeModal } = useChangePasswordModal();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const changePassword = useChangePassword();

  const navigate = useNavigate();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    changePassword.mutate(
      { oldPassword, password, passwordConfirm },
      {
        onSuccess: () => {
          setOldPassword("");
          setPassword("");
          setPasswordConfirm("");
          closeModal();
          navigate({ to: "/login" });
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal} title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
        <input
          autoFocus
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Current password"
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:outline-none dark:border-zinc-700"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:outline-none dark:border-zinc-700"
        />

        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:outline-none dark:border-zinc-700"
        />

        {changePassword.isError && (
          <p className="text-sm text-red-500">{changePassword.error.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={
              changePassword.isPending ||
              !oldPassword ||
              !password ||
              !passwordConfirm
            }
            className="rounded-lg bg-teal-500 px-3 py-1.5 text-white disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </form>
    </Dialog>
  );
}
