import { AtSign, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChangePasswordModal } from "../modals/useChangePasswordModal";
import { useUpdateUsernameModal } from "../modals/useUpdateUsernameModal";
import SettingsRow from "./SettingsRow";

export default function AccountDetailsSection() {
  const { user } = useAuth();
  const { openModal: openUpdateUsername } = useUpdateUsernameModal();
  const { openModal: openChangePassword } = useChangePasswordModal();

  return (
    <>
      <SettingsRow
        Icon={AtSign}
        label="Username"
        value={user?.name}
        onEdit={openUpdateUsername}
      />

      <SettingsRow Icon={Mail} label="Email" value={user?.email} />

      <SettingsRow
        Icon={KeyRound}
        label="Password"
        onEdit={openChangePassword}
      />
    </>
  );
}
