import ChangePasswordModal from "./ChangePasswordModal.tsx";
import CreateChannelModal from "./CreateChannelModal";
import CreateServerModal from "./CreateServerModal.tsx";
import DeleteChannelModal from "./DeleteChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";
import EditChannelModal from "./EditChannelModal";
import EditServerModal from "./EditServerModal.tsx";
import JoinServerModal from "./JoinServerModal.tsx";
import SettingsModal from "./SettingsModal.tsx";
import UpdateUsernameModal from "./UpdateUsernameModal.tsx";

export function GlobalModals() {
  return (
    <>
      <CreateServerModal />
      <JoinServerModal />
      <EditServerModal />
      <CreateChannelModal />
      <EditChannelModal />
      <DeleteMessageModal />
      <DeleteChannelModal />
      <DeleteServerModal />
      <SettingsModal />
      <UpdateUsernameModal />
      <ChangePasswordModal />
    </>
  );
}
