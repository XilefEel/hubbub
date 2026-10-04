import type { Server } from "../src/lib/types.ts";
import { test, expect } from "vitest";
import type { Message } from "../src/lib/types.ts";
import { makeUser, makeServer } from "./helpers.ts";
import PocketBase from "pocketbase";

test("logged-out user cannot create a server", async () => {
  const pb = new PocketBase("http://127.0.0.1:8091");

  await expect(
    pb.collection<Server>("servers").create({
      name: "My Server",
      owner: "someone-not-logged-in",
      inviteCode: Math.random().toString(36).slice(2, 10),
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("logged-in user can create a server", async () => {
  const alice = await makeUser("alice");
  const inviteCode = Math.random().toString(36).slice(2, 10);

  const server = await alice.pb.collection<Server>("servers").create({
    name: "Alice's Server",
    owner: alice.id,
    inviteCode,
  });

  expect(server.name).toBe("Alice's Server");
  expect(server.owner).toBe(alice.id);
  expect(server.inviteCode).toBe(inviteCode);
});

test("cannot create a server owned by someone else", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    alice.pb.collection<Server>("servers").create({
      name: "Evil",
      owner: bob.id,
      inviteCode: Math.random().toString(36).slice(2, 10),
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("non-member cannot read messages in a server", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { channel } = await makeServer(alice);

  await alice.pb.collection<Message>("messages").create({
    channel: channel.id,
    user: alice.id,
    content: "secret",
  });

  const messagesForBob = await bob.pb
    .collection<Message>("messages")
    .getList(1, 20, {
      filter: `channel = "${channel.id}"`,
    });

  expect(messagesForBob.items).toHaveLength(0);

  const messagesForAlice = await alice.pb
    .collection<Message>("messages")
    .getList(1, 20, {
      filter: `channel = "${channel.id}"`,
    });

  expect(messagesForAlice.items).toHaveLength(1);
});

test("non-member cannot post in a server", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { channel } = await makeServer(alice);

  await expect(
    bob.pb.collection<Message>("messages").create({
      channel: channel.id,
      user: bob.id,
      content: "I should not be able to post this",
    }),
  ).rejects.toMatchObject({ status: 400 });
});
