import CreateChannelModal from "./CreateChannelModal";
import DeleteChannelModal from "./DeleteChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";
import EditChannelModal from "./EditChannelModal";

export function GlobalModals() {
  return (
    <>
      <CreateChannelModal />
      <EditChannelModal />
      <DeleteMessageModal />
      <DeleteChannelModal />
      <DeleteServerModal />
    </>
  );
}
