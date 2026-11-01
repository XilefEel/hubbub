import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import type { Channel } from "../src/lib/types.ts";
import {
  addMember,
  makeFriends,
  makeServer,
  makeUser,
  url,
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
  const { server } = await makeServer(alice);

  const voiceChannel = await alice.pb.collection<Channel>("channels").create({
    name: "Voice Channel",
    server: server.id,
    type: "voice",
  });

  const response = await alice.pb.send<{ token: string; url: string }>(
    "/api/voice/token",
    {
      method: "POST",
      body: { type: "channel", id: voiceChannel.id },
    },
  );

  expect(response.token).toEqual(expect.any(String));
  expect(response.token.length).toBeGreaterThan(0);
  expect(response.url).toBe("ws://localhost:7881");
});

test("non-member cannot request a token for a server voice channel", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server } = await makeServer(alice);
  const voiceChannel = await alice.pb.collection<Channel>("channels").create({
    name: "Voice Channel",
    server: server.id,
    type: "voice",
  });

  await expect(
    bob.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "channel", id: voiceChannel.id },
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("user cannot request a token for a text channel", async () => {
  const alice = await makeUser("alice");
  const { channel } = await makeServer(alice);

  await expect(
    alice.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "channel", id: channel.id },
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("user cannot request a token for an unknown scope", async () => {
  const alice = await makeUser("alice");

  await expect(
    alice.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "unknown", id: "some-id" },
    }),
  ).rejects.toMatchObject({ status: 400 });

  await expect(
    alice.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "channel" },
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("user cannot request a token for an unknown channel", async () => {
  const alice = await makeUser("alice");

  await expect(
    alice.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "channel", id: "missing-channel" },
    }),
  ).rejects.toMatchObject({ status: 404 });
});

test("conversation member can request a voice token", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  await makeFriends(alice, bob);

  const conversation = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  const response = await bob.pb.send<{ token: string; url: string }>(
    "/api/voice/token",
    {
      method: "POST",
      body: {
        type: "conversation",
        id: conversation.conversationId,
      },
    },
  );

  expect(response.token).toEqual(expect.any(String));
  expect(response.url).toBe("ws://localhost:7881");
});

test("non-member cannot request a token for a conversation", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await makeFriends(alice, bob);

  const conversation = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  await expect(
    carol.pb.send("/api/voice/token", {
      method: "POST",
      body: {
        type: "conversation",
        id: conversation.conversationId,
      },
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("user cannot request a token for an unknown conversation", async () => {
  const alice = await makeUser("alice");

  await expect(
    alice.pb.send("/api/voice/token", {
      method: "POST",
      body: { type: "conversation", id: "missing-conversation" },
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("server member without prior voice presence can request a voice token", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const { server } = await makeServer(alice);

  await addMember(server.id, bob.id);

  const voiceChannel = await alice.pb.collection<Channel>("channels").create({
    name: "Voice Channel",
    server: server.id,
    type: "voice",
  });

  const response = await bob.pb.send<{ token: string }>("/api/voice/token", {
    method: "POST",
    body: { type: "channel", id: voiceChannel.id },
  });

  expect(response.token).toEqual(expect.any(String));
});
