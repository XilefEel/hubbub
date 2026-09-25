import type { RecordModel } from "pocketbase";

type BaseRecord = RecordModel & {
  created: string;
  updated: string;
};

export type User = BaseRecord & {
  name: string;
  avatar?: string;
};

export type Server = BaseRecord & {
  name: string;
  owner: string; // owner id
  inviteCode: string;
  icon?: string;
  expand?: {
    owner?: User;
  };
};

export type ServerRole = "owner" | "admin" | "member";

export type ServerMember = BaseRecord & {
  user: string; // user id
  server: string; // server id
  role: ServerRole;
  expand?: {
    user?: User;
    server?: Server;
  };
};

export type ChannelType = "text" | "voice";

export type Channel = BaseRecord & {
  name: string;
  server: string; // server id
  type: ChannelType;
  lastMessageAt?: string;
  expand?: {
    server?: Server;
  };
};

export type Message = BaseRecord & {
  content: string;
  channel: string; // channel id
  user: string; // user id
  replyTo?: string; // message id
  mentions?: string[]; // user ids
  attachments?: string[];
  expand?: {
    user?: User;
    replyTo?: Message;
    mentions?: User[];
  };
};

export type Reaction = BaseRecord & {
  message: string; // message id
  user: string; // user id
  emoji: string;
  expand?: {
    user?: User;
  };
};

export type VoiceTokenResponse = {
  token: string;
  url: string;
};

export type VoiceParticipant = BaseRecord & {
  user: string; // user id
  channel: string; // channel id
  expand?: {
    user?: User;
    channel?: Channel;
  };
};

export type ReadState = BaseRecord & {
  user: string; // user id
  channel: string; // channel id
  lastReadAt: string;
  mentionCount?: number;
  expand?: {
    user?: User;
    channel?: Channel;
  };
};
