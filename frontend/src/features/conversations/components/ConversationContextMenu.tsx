import { BaseContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";
import type { Conversation } from "@/lib/types";
import { CheckCheck, Edit, LogOut } from "lucide-react";

export default function ConversationContextMenu({
  conversation,
  isOwner,
  children,
}: {
  conversation: Conversation;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  return (
    <BaseContextMenu
      disabled={!conversation.isGroup}
      content={
        <>
          <ContextMenuItem
            action={() => {}}
            Icon={Edit}
            label="Edit Conversation"
            show={isOwner}
          />

          <ContextMenuItem
            action={() => {}}
            Icon={CheckCheck}
            label="Mark as Read"
          />

          <ContextMenuItem
            action={() => {}}
            Icon={LogOut}
            label="Leave Conversation"
            show={!isOwner}
            isDelete
          />
        </>
      }
    >
      {children}
    </BaseContextMenu>
  );
}
