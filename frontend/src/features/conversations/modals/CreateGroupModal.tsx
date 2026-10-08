import { useCreateGroupModal } from "./useCreateGroupModal";
import CreateGroupForm from "../components/CreateGroupForm";
import EditGroupForm from "../components/EditGroupForm";
import Dialog from "@/components/ui/Dialog";

export default function CreateGroupModal() {
  const { isOpen, closeModal, setIsOpen, conversation } = useCreateGroupModal();
  const isEdit = conversation?.isGroup === true;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={isEdit ? "Edit Group" : "Create Group"}
    >
      {isEdit ? (
        <EditGroupForm
          key={conversation.id}
          conversation={conversation}
          onDone={closeModal}
        />
      ) : (
        <CreateGroupForm key={conversation?.id ?? "new"} onDone={closeModal} />
      )}
    </Dialog>
  );
}
