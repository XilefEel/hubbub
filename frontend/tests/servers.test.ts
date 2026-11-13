import type { Server, Message } from "../src/lib/types.ts";
import { test, expect } from "vitest";
import { makeUser, makeServer, makeServerWithMember, url } from "./helpers.ts";
import PocketBase from "pocketbase";

test("logged-out user cannot create a server", async () => {
  const unauthenticated = new PocketBase(url);

  await expect(
    unauthenticated.collection<Server>("servers").create({
      name: "My Server",
      owner: "someone-not-logged-in",
      inviteCode: Math.random().toString(36).slice(2, 10),
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("logged-in user can create a server", async () => {
  const alice = await makeUser("alice");

  const server = await alice.pb
    .collection<Server>("servers")
    .create({ name: "Alice's Server" });

  expect(server.name).toBe("Alice's Server");
  expect(server.owner).toBe(alice.id);
  expect(server.inviteCode).toMatch(/^[a-z0-9]{8}$/);
});

test("cannot send owner or inviteCode when creating a server", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    alice.pb.collection<Server>("servers").create({
      name: "Evil",
      owner: bob.id,
      inviteCode: "hacked00",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("each server gets a distinct invite code", async () => {
  const alice = await makeUser("alice");
  const a = await alice.pb.collection<Server>("servers").create({ name: "A" });
  const b = await alice.pb.collection<Server>("servers").create({ name: "B" });
  expect(a.inviteCode).not.toBe(b.inviteCode);
});

test("non-member cannot list or view server they are not a member of", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server } = await makeServer(alice);

  await expect(
    bob.pb.collection<Server>("servers").getOne(server.id),
  ).rejects.toMatchObject({ status: 404 });
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

test("only owner can edit a server", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  await expect(
    bob.pb.collection<Server>("servers").update(server.id, {
      name: "Bob's Evil Server",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const unchanged = await alice.pb
    .collection<Server>("servers")
    .getOne(server.id);

  expect(unchanged.name).toBe(server.name);

  const updated = await alice.pb
    .collection<Server>("servers")
    .update(server.id, {
      name: "Alice's Updated Server",
    });

  expect(updated.name).toBe("Alice's Updated Server");
});

test("only owner can delete a server", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  await expect(
    bob.pb.collection<Server>("servers").delete(server.id),
  ).rejects.toMatchObject({ status: 404 });

  const stillExists = await alice.pb
    .collection<Server>("servers")
    .getOne(server.id);

  expect(stillExists).toBeDefined();

  await alice.pb.collection<Server>("servers").delete(server.id);

  await expect(
    alice.pb.collection<Server>("servers").getOne(server.id),
  ).rejects.toMatchObject({ status: 404 });
});
