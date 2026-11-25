import { useCurrentMember } from "@/features/members/hooks/useServerMembers";
import { useServerDetail } from "@/features/servers/hooks/useServers";
import { useMemo } from "react";
import {
  NO_PERMS,
  ALL_PERMS,
  addPerm,
  hasPerm,
  Perm,
} from "../utils/permissions";
import { useRoles } from "./useRoles";

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
