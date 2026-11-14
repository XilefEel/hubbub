import CreateChannelModal from "@/features/channels/modals/CreateChannelModal";
import DeleteChannelModal from "@/features/channels/modals/DeleteChannelModal";
import EditChannelModal from "@/features/channels/modals/EditChannelModal";
import CreateGroupModal from "@/features/conversations/modals/GroupModal";
import DeleteMessageModal from "@/features/messages/modals/DeleteMessageModal";
import DeleteServerModal from "@/features/servers/modals/DeleteServerModal";
import JoinServerModal from "@/features/servers/modals/JoinServerModal";
import ServerModal from "@/features/servers/modals/ServerModal";
import ChangePasswordModal from "@/features/settings/modals/ChangePasswordModal";
import SettingsModal from "@/features/settings/modals/SettingsModal";
import UpdateUsernameModal from "@/features/settings/modals/UpdateUsernameModal";

export default function GlobalModals() {
  return (
    <>
      <ServerModal />
      <JoinServerModal />
      <CreateChannelModal />
      <EditChannelModal />
      <DeleteMessageModal />
      <DeleteChannelModal />
      <DeleteServerModal />
      <SettingsModal />
      <UpdateUsernameModal />
      <ChangePasswordModal />
      <CreateGroupModal />
    </>
  );
}
