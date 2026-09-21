import { useEffect, type RefObject } from "react";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import {
  useIsChannelsOpen,
  useIsMembersOpen,
  useUIActions,
} from "@/app/stores/useUIStore";

export function usePanelSync({
  channelsRef,
  membersRef,
}: {
  channelsRef: RefObject<PanelImperativeHandle | null>;
  membersRef: RefObject<PanelImperativeHandle | null>;
}) {
  const isChannelsOpen = useIsChannelsOpen();
  const isMembersOpen = useIsMembersOpen();
  const { setIsChannelsOpen, setIsMembersOpen } = useUIActions();

  const handleChannelsResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsChannelsOpen(isOpen);
  };

  const handleMembersResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsMembersOpen(isOpen);
  };

  useEffect(() => {
    if (isChannelsOpen === null) return;
    if (isChannelsOpen) channelsRef.current?.expand();
    else channelsRef.current?.collapse();
  }, [isChannelsOpen, channelsRef]);

  useEffect(() => {
    if (isMembersOpen === null) return;
    if (isMembersOpen) membersRef.current?.expand();
    else membersRef.current?.collapse();
  }, [isMembersOpen, membersRef]);

  return { handleChannelsResize, handleMembersResize };
}
