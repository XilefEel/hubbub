import type { Slice } from "@/app/modals/useModalStore";

export type RoleSlice = {
  isRoleOpen: boolean;
  roleServerId: string | null;
  setIsRoleOpen: (open: boolean) => void;
  openRoleModal: (serverId: string) => void;
  closeRoleModal: () => void;
};

export const roleSlice: Slice<RoleSlice> = (set) => ({
  isRoleOpen: false,
  roleServerId: null,
  setIsRoleOpen: (open) => set({ isRoleOpen: open }),
  openRoleModal: (serverId) =>
    set({ isRoleOpen: true, roleServerId: serverId }),
  closeRoleModal: () => set({ isRoleOpen: false }),
});
