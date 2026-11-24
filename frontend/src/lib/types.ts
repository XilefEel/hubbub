import type { Permission } from "@/features/roles/utils/roles";
import type { RecordModel } from "pocketbase";

declare const dateTimeBrand: unique symbol;
export type DateTime = string & { readonly [dateTimeBrand]: true };

type BaseRecord = Pick<
  RecordModel,
  "id" | "collectionId" | "collectionName"
> & {
  created: DateTime;
  updated: DateTime;
};

export type PresencePreference = "auto" | "dnd" | "invisible";

export const PRESENCE_STATUSES = ["online", "dnd"] as const;
export type PresenceStatus = (typeof PRESENCE_STATUSES)[number];

export type User = BaseRecord & {
  name: string;
  bio?: string;
  bannerColor?: string;
  avatar?: string;
  presencePreference?: PresencePreference;
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

export type Role = BaseRecord & {
  server: string;
  name: string;
  color: string;
  position: number;
  permissions: Permission;
  mentionable: boolean;
};

export type ServerMember = BaseRecord & {
  user: string; // user id
  server: string; // server id
  roles: string[]; // role ids
  expand?: {
    user?: User;
    server?: Server;
    roles?: Role[];
  };
};

export type ChannelType = "text" | "voice";

export type Channel = BaseRecord & {
  name: string;
  server: string; // server id
  type: ChannelType;
  lastMessageAt?: DateTime;
  expand?: {
    server?: Server;
  };
};

export type MessageScope =
  { type: "channel"; id: string } | { type: "conversation"; id: string };

export type Message = BaseRecord & {
  content: string;
  channel?: string; // channel id
  conversation?: string; // conversation id
  user: string; // user id
  replyTo?: string; // message id
  mentions?: string[]; // user ids
  attachments?: string[];
  sticker?: string; // sticker id
  expand?: {
    user?: User;
    replyTo?: Message;
    mentions?: User[];
    sticker?: Sticker;
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

export type VoiceScope = MessageScope;

export type VoiceTokenResponse = {
  token: string;
  url: string;
};

export type VoiceParticipant = BaseRecord & {
  user: string; // user id
  channel?: string; // channel id
  conversation?: string; // conversation id
  expand?: {
    user?: User;
    channel?: Channel;
    conversation?: Conversation;
  };
};

export type ReadState = BaseRecord & {
  user: string; // user id
  channel: string; // channel id
  lastReadAt: DateTime;
  mentionCount?: number;
  expand?: {
    user?: User;
    channel?: Channel;
  };
};

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = BaseRecord & {
  requester: string; // user id
  addressee: string; // user id
  status: FriendshipStatus;
  expand?: {
    requester?: User;
    addressee?: User;
  };
};

export type FriendRequestStatus =
  "sent" | "not_found" | "already_friends" | "already_pending" | "self";

export type SendFriendRequestResult = {
  status: FriendRequestStatus;
};

export type FriendshipRelation =
  | { kind: "none" }
  | { kind: "outgoing_pending"; friendship: Friendship }
  | { kind: "incoming_pending"; friendship: Friendship }
  | { kind: "friends"; friendship: Friendship };

export type Conversation = BaseRecord & {
  isGroup: boolean;
  name?: string;
  owner?: string; // owner id
  lastMessageAt?: DateTime;
  expand?: {
    conversation_members_via_conversation?: ConversationMember[];
  };
};

export type ConversationMember = BaseRecord & {
  user: string; // user id
  conversation: string; // conversation id
  lastReadAt?: DateTime;
  hiddenAt?: DateTime;
  expand?: {
    user?: User;
    conversation?: Conversation;
  };
};

export type Sticker = BaseRecord & {
  file: string;
  creator: string; // user id
  expand?: {
    creator?: User;
  };
};

export type UserSticker = BaseRecord & {
  user: string; // user id
  sticker: string; // sticker id
  expand?: {
    sticker?: Sticker;
  };
};
