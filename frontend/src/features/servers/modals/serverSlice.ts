import type { Slice } from "@/app/modals/types";
import type { Server } from "@/lib/types";

export type ServerSlice = {
  isOpen: boolean;
  server: Server | null;
  openCreate: () => void;
  openEdit: (server: Server) => void;
  closeModal: () => void;
  setIsOpen: (open: boolean) => void;
};

export const serverSlice: Slice<ServerSlice> = (set) => ({
  isOpen: false,
  server: null,
  openCreate: () => set({ isOpen: true, server: null }),
  openEdit: (server) => set({ isOpen: true, server }),
  closeModal: () => set({ isOpen: false }),
  setIsOpen: (open) => set({ isOpen: open }),
});
