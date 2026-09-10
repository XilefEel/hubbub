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

export type ServerRole = "owner" | "admin" | "member";

export type ServerMember = RecordModel & {
  server: string; // server id
  user: string; // user id
  role: ServerRole;
  expand?: {
    user?: User;
    server?: Server;
  };
};

export type ChannelType = "text" | "voice";

export type Channel = RecordModel & {
  name: string;
  server: string; // server id
  type: ChannelType;
  expand?: {
    server?: Server;
  };
};

export type Message = RecordModel & {
  content: string;
  channel: string; // channel id
  user: string; // user id
  attachments?: string[];
  expand?: {
    user?: User;
  };
};
