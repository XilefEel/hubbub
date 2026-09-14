import { useEffect, type RefObject } from "react";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import {
  useIsLeftbarOpen,
  useIsRightbarOpen,
  useUIActions,
} from "../stores/useUIStore";

export function usePanelSync({
  channelsRef,
  membersRef,
}: {
  channelsRef: RefObject<PanelImperativeHandle | null>;
  membersRef: RefObject<PanelImperativeHandle | null>;
}) {
  const isLeftbarOpen = useIsLeftbarOpen();
  const isRightbarOpen = useIsRightbarOpen();
  const { setIsLeftbarOpen, setIsRightbarOpen } = useUIActions();

  const handleLeftbarResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsLeftbarOpen(isOpen);
  };

  const handleRightbarResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsRightbarOpen(isOpen);
  };

  useEffect(() => {
    if (isLeftbarOpen === null) return;
    if (isLeftbarOpen) channelsRef.current?.expand();
    else channelsRef.current?.collapse();
  }, [isLeftbarOpen, channelsRef]);

  useEffect(() => {
    if (isRightbarOpen === null) return;
    if (isRightbarOpen) membersRef.current?.expand();
    else membersRef.current?.collapse();
  }, [isRightbarOpen, membersRef]);

  return { handleLeftbarResize, handleRightbarResize };
}
