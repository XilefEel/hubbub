import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import {
  addMember,
  makeFriends,
  makeServer,
  makeUser,
  url,
} from "./helpers.ts";
import type { Channel } from "../src/lib/types.ts";

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

  await expect(
    bob.pb.send(`/api/channels/${channel.id}/typing`, { method: "POST" }),
  ).rejects.toMatchObject({ status: 403 });
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
  const { server } = await makeServer(alice);

  const voiceChannel = await alice.pb.collection<Channel>("channels").create({
    name: "Voice Channel",
    server: server.id,
    type: "voice",
  });

  await expect(
    alice.pb.send(`/api/channels/${voiceChannel.id}/typing`, {
      method: "POST",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("server members can send channel typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const { server, channel } = await makeServer(alice);
  await addMember(server.id, bob.id);

  await expect(
    bob.pb.send(`/api/channels/${channel.id}/typing`, { method: "POST" }),
  ).resolves.toEqual({});
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

  const { conversationId } = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  await expect(
    bob.pb.send(`/api/conversations/${conversationId}/typing`, {
      method: "POST",
    }),
  ).resolves.toEqual({});
});

test("non-members cannot send conversation typing events", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await makeFriends(alice, bob);

  const { conversationId } = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  await expect(
    carol.pb.send(`/api/conversations/${conversationId}/typing`, {
      method: "POST",
    }),
  ).rejects.toMatchObject({ status: 403 });
});
