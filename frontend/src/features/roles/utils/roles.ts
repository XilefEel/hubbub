import { useServerDetail } from "@/features/servers/hooks/useServers";
import { useRoles } from "../hooks/useRoles";
import { useMemo } from "react";
import { useCurrentMember } from "@/features/members/hooks/useServerMembers";

declare const permissionBrand: unique symbol;
export type Permission = number & { readonly [permissionBrand]: true };

const p = (bit: number) => (1 << bit) as Permission;

export const Perm = {
  Administrator: p(0),
  ManageServer: p(1),
  ManageChannels: p(2),
  ManageRoles: p(3),
  ManageMessages: p(4),
  KickMembers: p(5),
  BanMembers: p(6),
  MentionEveryone: p(7),
} as const;

export const NO_PERMS = 0 as Permission;
export const ALL_PERMS = (p(8) - 1) as Permission;

export const hasPerm = (perms: Permission, flag: Permission) =>
  (perms & flag) === flag;

export const addPerm = (perms: Permission, flag: Permission) =>
  (perms | flag) as Permission;

export const togglePerm = (perms: Permission, flag: Permission) =>
  (perms ^ flag) as Permission;

export function usePermissions(serverId: string) {
  const { data: server } = useServerDetail(serverId);
  const { data: roles } = useRoles(serverId);
  const member = useCurrentMember(serverId);

  return useMemo(() => {
    if (!server || !roles || !member) return NO_PERMS;
    if (server.owner === member.user) return ALL_PERMS;

    let perms = NO_PERMS;
    for (const role of roles) {
      if (member.roles.includes(role.id)) {
        perms = addPerm(perms, role.permissions);
      }
    }

    if (hasPerm(perms, Perm.Administrator)) return ALL_PERMS;

    return perms;
  }, [server, roles, member]);
}

type PermissionMap = Record<keyof typeof Perm, boolean>;

export function useMyPerms(serverId: string): PermissionMap {
  const perms = usePermissions(serverId);

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(Perm).map(([name, flag]) => [
          name,
          hasPerm(perms, flag),
        ]),
      ) as PermissionMap,
    [perms],
  );
}
