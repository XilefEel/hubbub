import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import {
  addMember,
  makeDm,
  makeServer,
  makeServerWithVoiceChannel,
  makeUser,
  requestVoiceToken,
  url,
  wsUrl,
} from "./helpers.ts";

test("logged-out user cannot request a voice token", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "channel", id: "missing-channel" },
    }),
  ).rejects.toMatchObject({ status: 401 });
});

test("server member can request a token for a voice channel", async () => {
  const alice = await makeUser("alice");
  const { voiceChannel } = await makeServerWithVoiceChannel(alice);

  const response = await requestVoiceToken(alice, {
    type: "channel",
    id: voiceChannel.id,
  });

  expect(response.token).toEqual(expect.any(String));
  expect(response.token.length).toBeGreaterThan(0);
  expect(response.url).toBe(wsUrl);
});

test("non-member cannot request a token for a server voice channel", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { voiceChannel } = await makeServerWithVoiceChannel(alice);

  await expect(
    requestVoiceToken(bob, { type: "channel", id: voiceChannel.id }),
  ).rejects.toMatchObject({ status: 403 });
});

test("user cannot request a token for a text channel", async () => {
  const alice = await makeUser("alice");

  const { channel } = await makeServer(alice);

  await expect(
    requestVoiceToken(alice, { type: "channel", id: channel.id }),
  ).rejects.toMatchObject({ status: 400 });
});

test("user cannot request a token for an unknown scope", async () => {
  const alice = await makeUser("alice");

  await expect(
    requestVoiceToken(alice, { type: "unknown", id: "some-id" }),
  ).rejects.toMatchObject({ status: 400 });

  await expect(
    requestVoiceToken(alice, { type: "channel" }),
  ).rejects.toMatchObject({ status: 400 });
});

test("user cannot request a token for an unknown channel", async () => {
  const alice = await makeUser("alice");

  await expect(
    requestVoiceToken(alice, { type: "channel", id: "missing-channel" }),
  ).rejects.toMatchObject({ status: 404 });
});

test("conversation member can request a voice token", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const conversationId = await makeDm(alice, bob);

  const response = await requestVoiceToken(bob, {
    type: "conversation",
    id: conversationId,
  });

  expect(response.token).toEqual(expect.any(String));
  expect(response.url).toBe(wsUrl);
});

test("non-member cannot request a token for a conversation", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  const conversationId = await makeDm(alice, bob);

  await expect(
    requestVoiceToken(carol, { type: "conversation", id: conversationId }),
  ).rejects.toMatchObject({ status: 403 });
});

test("user cannot request a token for an unknown conversation", async () => {
  const alice = await makeUser("alice");

  await expect(
    requestVoiceToken(alice, {
      type: "conversation",
      id: "missing-conversation",
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("server member without prior voice presence can request a voice token", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, voiceChannel } = await makeServerWithVoiceChannel(alice);

  await addMember(server.id, bob.id);

  const response = await requestVoiceToken(bob, {
    type: "channel",
    id: voiceChannel.id,
  });

  expect(response.token).toEqual(expect.any(String));
});
