import type { Slice } from "@/app/modals/useModalStore";
import type { Server } from "@/lib/types";

export type ServerSlice = {
  isServerOpen: boolean;
  serverModalServer: Server | null;
  setServerOpen: (isOpen: boolean) => void;
  openCreateServerModal: () => void;
  openEditServerModal: (server: Server) => void;
  closeServerModal: () => void;
};

export const serverSlice: Slice<ServerSlice> = (set) => ({
  isServerOpen: false,
  serverModalServer: null,
  setServerOpen: (isOpen) => set({ isServerOpen: isOpen }),
  openCreateServerModal: () =>
    set({ isServerOpen: true, serverModalServer: null }),
  openEditServerModal: (server) =>
    set({ isServerOpen: true, serverModalServer: server }),
  closeServerModal: () => set({ isServerOpen: false }),
});
