import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import {
  addMember,
  makeFriends,
  makeServer,
  makeServerWithVoiceChannel,
  makeUser,
  openDm,
  sendChannelTyping,
  sendConversationTyping,
  url,
} from "./helpers.ts";

test("logged-out user cannot send channel typing events", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/channels/missing-channel/typing", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401 });
});

test("non-member cannot send channel typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const { channel } = await makeServer(alice);

  await expect(sendChannelTyping(bob, channel.id)).rejects.toMatchObject({
    status: 403,
  });
});

test("server members cannot send typing events to non-existent channels", async () => {
  const alice = await makeUser("alice");

  await expect(
    alice.pb.send("/api/channels/missing-channel/typing", {
      method: "POST",
    }),
  ).rejects.toMatchObject({ status: 404 });
});

test("server members cannot send typing events to voice channels", async () => {
  const alice = await makeUser("alice");
  const { voiceChannel } = await makeServerWithVoiceChannel(alice);

  await expect(sendChannelTyping(alice, voiceChannel.id)).rejects.toMatchObject(
    { status: 400 },
  );
});

test("server members can send channel typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);
  await addMember(server.id, bob.id);

  await expect(sendChannelTyping(bob, channel.id)).resolves.toEqual({});
});

test("logged-out user cannot send conversation typing events", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/conversations/missing-conversation/typing", {
      method: "POST",
    }),
  ).rejects.toMatchObject({ status: 401 });
});

test("conversation members can send conversation typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  await makeFriends(alice, bob);

  const { conversationId } = await openDm(alice, bob);

  await expect(sendConversationTyping(bob, conversationId)).resolves.toEqual(
    {},
  );
});

test("non-members cannot send conversation typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await makeFriends(alice, bob);

  const { conversationId } = await openDm(alice, bob);

  await expect(
    sendConversationTyping(carol, conversationId),
  ).rejects.toMatchObject({ status: 403 });
});
