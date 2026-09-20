import ChangePasswordModal from "./ChangePasswordModal";
import CreateChannelModal from "./CreateChannelModal";
import CreateServerModal from "./CreateServerModal";
import DeleteChannelModal from "./DeleteChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";
import EditChannelModal from "./EditChannelModal";
import EditServerModal from "./EditServerModal";
import JoinServerModal from "./JoinServerModal";
import SettingsModal from "./SettingsModal";
import UpdateUsernameModal from "./UpdateUsernameModal";

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
