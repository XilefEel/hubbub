import CreateChannelModal from "./CreateChannelModal";
import CreateServerModal from "./CreateServerModal.tsx";
import DeleteChannelModal from "./DeleteChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";
import EditChannelModal from "./EditChannelModal";

export function GlobalModals() {
  return (
    <>
      <CreateServerModal />
      <CreateChannelModal />
      <EditChannelModal />
      <DeleteMessageModal />
      <DeleteChannelModal />
      <DeleteServerModal />
    </>
  );
}
