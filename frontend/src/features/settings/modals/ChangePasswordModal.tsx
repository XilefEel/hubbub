import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useChangePasswordModal } from "@/app/modals/useModalStore";
import { useChangePassword } from "../../auth/hooks/useAuth";
import Dialog from "@/components/ui/Dialog";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";

export default function ChangePasswordModal() {
  const { isOpen, setIsOpen, closeModal } = useChangePasswordModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Change Password">
      <ChangePasswordForm onSuccess={closeModal} />
    </Dialog>
  );
}

function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const changePassword = useChangePassword();
  const navigate = useNavigate();

  const passwordsMatch = password === passwordConfirm;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    changePassword.mutate(
      { oldPassword, password, passwordConfirm },
      {
        onSuccess: () => {
          onSuccess?.();
          navigate({ to: "/login" });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <Input
        autoFocus
        type="password"
        autoComplete="current-password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        placeholder="Current password"
        disabled={changePassword.isPending}
      />

      <Input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        disabled={changePassword.isPending}
      />

      <Input
        type="password"
        autoComplete="new-password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="Confirm new password"
        disabled={changePassword.isPending}
      />

      {passwordConfirm && !passwordsMatch && (
        <p className="text-sm text-red-500">Passwords do not match</p>
      )}

      {changePassword.isError && (
        <p className="text-sm text-red-500">{changePassword.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton
          disabled={
            changePassword.isPending ||
            !oldPassword ||
            !password ||
            !passwordConfirm ||
            !passwordsMatch
          }
        >
          {changePassword.isPending ? "Saving..." : "Update"}
        </SubmitButton>
      </div>
    </form>
  );
}
