import ChangePasswordModal from "../../features/settings/modals/ChangePasswordModal";
import CreateChannelModal from "../../features/channels/modals/CreateChannelModal";
import CreateServerModal from "../../features/servers/modals/CreateServerModal";
import DeleteChannelModal from "../../features/channels/modals/DeleteChannelModal";
import DeleteMessageModal from "../../features/messages/modals/DeleteMessageModal";
import DeleteServerModal from "../../features/servers/modals/DeleteServerModal";
import EditChannelModal from "../../features/channels/modals/EditChannelModal";
import EditServerModal from "../../features/servers/modals/EditServerModal";
import JoinServerModal from "../../features/servers/modals/JoinServerModal";
import SettingsModal from "../../features/settings/modals/SettingsModal";
import UpdateUsernameModal from "../../features/settings/modals/UpdateUsernameModal";

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
