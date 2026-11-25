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
