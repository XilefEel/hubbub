import CreateChannelModal from "@/features/channels/modals/CreateChannelModal";
import DeleteChannelModal from "@/features/channels/modals/DeleteChannelModal";
import EditChannelModal from "@/features/channels/modals/EditChannelModal";
import CreateGroupModal from "@/features/conversations/modals/CreateGroupModal";
import DeleteMessageModal from "@/features/messages/modals/DeleteMessageModal";
import CreateServerModal from "@/features/servers/modals/CreateServerModal";
import DeleteServerModal from "@/features/servers/modals/DeleteServerModal";
import EditServerModal from "@/features/servers/modals/EditServerModal";
import JoinServerModal from "@/features/servers/modals/JoinServerModal";
import ChangePasswordModal from "@/features/settings/modals/ChangePasswordModal";
import SettingsModal from "@/features/settings/modals/SettingsModal";
import UpdateUsernameModal from "@/features/settings/modals/UpdateUsernameModal";

export default function GlobalModals() {
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
      <CreateGroupModal />
    </>
  );
}
