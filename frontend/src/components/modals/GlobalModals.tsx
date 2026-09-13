import CreateChannelModal from "./CreateChannelModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteServerModal from "./DeleteServerModal";

export function GlobalModals() {
  return (
    <>
      <CreateChannelModal />
      <DeleteMessageModal />
      <DeleteServerModal />
    </>
  );
}
