import { useEffect, type RefObject } from "react";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import { useIsConversationsOpen, useUIActions } from "@/app/stores/useUIStore";

export function usePanelSync({
  sidebarRef,
}: {
  sidebarRef: RefObject<PanelImperativeHandle | null>;
}) {
  const isConversationsOpen = useIsConversationsOpen();
  const { setIsConversationsOpen } = useUIActions();

  const handleConversationsResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsConversationsOpen(isOpen);
  };

  useEffect(() => {
    if (isConversationsOpen === null) return;
    if (isConversationsOpen) sidebarRef.current?.expand();
    else sidebarRef.current?.collapse();
  }, [isConversationsOpen, sidebarRef]);

  return { handleConversationsResize };
}
