import PocketBase from "pocketbase";
import type {
  Server,
  Channel,
  ServerMember,
  ServerRole,
  Friendship,
  ConversationMember,
} from "../src/lib/types.ts";

export const url = "http://127.0.0.1:8091";
export const wsUrl = "ws://localhost:7881";

export type TestUser = {
  pb: PocketBase;
  id: string;
};

export type PresenceResponse = {
  online: string[];
};

export type ConversationResponse = {
  conversationId: string;
};

export type VoiceTokenResponse = { token: string; url: string };

export async function makeUser(name: string): Promise<TestUser> {
  const pb = new PocketBase(url);

  const uniqueName = `${name}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${uniqueName}@test.com`;
  const password = "password123";

  const user = await pb.collection("users").create({
    name: uniqueName,
    email,
    password,
    passwordConfirm: password,
  });

  await pb.collection("users").authWithPassword(email, password);

  return { pb, id: user.id };
}

export async function makeServer(owner: TestUser) {
  const server = await owner.pb.collection<Server>("servers").create({
    name: `${owner.id}'s Server`,
  });

  const channel = await owner.pb
    .collection<Channel>("channels")
    .getFirstListItem(owner.pb.filter("server = {:id}", { id: server.id }));

  return { server, channel };
}

export async function makeServerWithVoiceChannel(owner: TestUser) {
  const { server, channel } = await makeServer(owner);
  const voiceChannel = await makeVoiceChannel(owner, server.id);

  return { server, channel, voiceChannel };
}

export async function makeServerWithMember() {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);
  await addMember(server.id, bob.id);

  return { alice, bob, server, channel };
}

export async function makeTextChannel(
  owner: TestUser,
  serverId: string,
  channelName: string = "text-channel",
) {
  return owner.pb.collection<Channel>("channels").create({
    name: channelName,
    server: serverId,
    type: "text",
  });
}

export async function makeVoiceChannel(
  owner: TestUser,
  serverId: string,
  channelName: string = "voice-channel",
) {
  return await owner.pb.collection<Channel>("channels").create({
    name: channelName,
    server: serverId,
    type: "voice",
  });
}

export async function makeDm(a: TestUser, b: TestUser) {
  await makeFriends(a, b);
  const { conversationId } = await openDm(a, b);

  return conversationId;
}

export async function sendMessageInChannel(
  user: TestUser,
  channelId: string,
  content: string,
) {
  return await user.pb.collection("messages").create({
    channel: channelId,
    user: user.id,
    content,
  });
}

export async function sendMessageInConversation(
  user: TestUser,
  conversationId: string,
  content: string,
) {
  return await user.pb.collection("messages").create({
    conversation: conversationId,
    user: user.id,
    content,
  });
}

let cachedAdmin: PocketBase | null = null;

export async function admin() {
  if (cachedAdmin?.authStore.isValid) return cachedAdmin;

  const pb = new PocketBase(url);
  pb.autoCancellation(false);

  await pb
    .collection("_superusers")
    .authWithPassword("admin@test.com", "adminpass123");

  cachedAdmin = pb;
  return pb;
}

export async function addMember(
  serverId: string,
  userId: string,
  role: ServerRole = "member",
) {
  const a = await admin();

  await a.collection<ServerMember>("server_members").create({
    server: serverId,
    user: userId,
    role,
  });
}

export async function makeFriends(requester: TestUser, addressee: TestUser) {
  const friendship = await requester.pb
    .collection<Friendship>("friendships")
    .create({
      requester: requester.id,
      addressee: addressee.id,
      status: "pending",
    });

  await addressee.pb
    .collection<Friendship>("friendships")
    .update(friendship.id, { status: "accepted" });
}

export async function getConversationMembers(
  user: TestUser,
  conversationId: string,
) {
  return await user.pb
    .collection<ConversationMember>("conversation_members")
    .getFullList({
      filter: user.pb.filter("conversation = {:conversationId}", {
        conversationId,
      }),
    });
}

export async function openDm(user: TestUser, target: TestUser) {
  return await user.pb.send<ConversationResponse>("/api/dms/open", {
    method: "POST",
    body: { userId: target.id },
  });
}

export async function sendChannelTyping(user: TestUser, channelId: string) {
  return await user.pb.send(`/api/channels/${channelId}/typing`, {
    method: "POST",
  });
}

export async function sendConversationTyping(
  user: TestUser,
  conversationId: string,
) {
  return await user.pb.send(`/api/conversations/${conversationId}/typing`, {
    method: "POST",
  });
}

export async function heartbeat(user: TestUser) {
  return await user.pb.send<PresenceResponse>("/api/presence/heartbeat", {
    method: "POST",
  });
}

export async function requestVoiceToken(
  user: TestUser,
  body: { type: string; id?: string },
) {
  return await user.pb.send<VoiceTokenResponse>("/api/voice/token", {
    method: "POST",
    body,
  });
}
