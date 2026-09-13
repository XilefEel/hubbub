import CreateChannelModal from "./CreateChannelModal";
import DeleteChannelModal from "./DeleteChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";

export function GlobalModals() {
  return (
    <>
      <CreateChannelModal />
      <DeleteMessageModal />
      <DeleteChannelModal />
      <DeleteServerModal />
    </>
  );
}
