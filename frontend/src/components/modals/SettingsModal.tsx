import { useSettingsModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";

export default function SettingsModal() {
  const { isOpen, closeModal } = useSettingsModal();

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      title="Settings"
      width="max-w-3xl"
    >
      <p>Settings</p>
    </Dialog>
  );
}
