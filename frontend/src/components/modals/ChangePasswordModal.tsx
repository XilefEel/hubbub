import { useState } from "react";
import { useChangePasswordModal } from "../../stores/useModalStore";
import Dialog from "../ui/Dialog";
import { useChangePassword } from "../../hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import SubmitButton from "../ui/SubmitButton";
import Input from "../ui/Input";

export default function ChangePasswordModal() {
  const { isOpen, setIsOpen, closeModal } = useChangePasswordModal();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
        <Input
          autoFocus
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Current password"
        />

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
        />

        <Input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Confirm new password"
        />

        {changePassword.isError && (
          <p className="text-sm text-red-500">{changePassword.error.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <SubmitButton
            disabled={
              changePassword.isPending ||
              !oldPassword ||
              !password ||
              !passwordConfirm
            }
          >
            Update
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
