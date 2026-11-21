import PocketBase, { type RecordModel, type RecordService } from "pocketbase";
import { Collections } from "./collections";
import type {
  User,
  Server,
  ServerMember,
  Channel,
  Message,
  Reaction,
  VoiceParticipant,
  ReadState,
  Friendship,
  Conversation,
  ConversationMember,
  Sticker,
  UserSticker,
  Role,
} from "./types";

type CollectionRecords = {
  [Collections.Users]: User;
  [Collections.Servers]: Server;
  [Collections.ServerMembers]: ServerMember;
  [Collections.Channels]: Channel;
  [Collections.Messages]: Message;
  [Collections.Reactions]: Reaction;
  [Collections.VoiceParticipants]: VoiceParticipant;
  [Collections.ReadStates]: ReadState;
  [Collections.Friendships]: Friendship;
  [Collections.Conversations]: Conversation;
  [Collections.ConversationMembers]: ConversationMember;
  [Collections.Stickers]: Sticker;
  [Collections.UserStickers]: UserSticker;
  [Collections.Roles]: Role;
};

export interface TypedPocketBase extends PocketBase {
  collection<K extends keyof CollectionRecords>(
    idOrName: K,
  ): RecordService<CollectionRecords[K]>;
  collection<M = RecordModel>(idOrName: string): RecordService<M>;
}

export const pb = new PocketBase("/") as TypedPocketBase;
pb.autoCancellation(false);
