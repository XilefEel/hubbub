import type { RecordModel } from "pocketbase";

export type User = RecordModel & {
  name: string;
};

export type Server = RecordModel & {
  name: string;
  owner: string; // owner id
  inviteCode: string;
  expand?: {
    owner?: User;
  };
};

export type ServerMember = RecordModel & {
  server: string; // server id
  user: string; // user id
  role: "owner" | "admin" | "member";
  expand?: {
    user?: User;
    server?: Server;
  };
};
