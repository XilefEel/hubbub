import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import { heartbeat, makeUser, updatePresenceStatus, url } from "./helpers.ts";
import { Collections } from "../src/lib/collections.ts";

test("logged-out user cannot send a presence heartbeat", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/presence/heartbeat", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401 });
});

test("authenticated user is included in the presence heartbeat response", async () => {
  const alice = await makeUser("alice");

  const response = await heartbeat(alice);

  expect(response.online).toMatchObject({
    [alice.id]: "online",
  });
});

test("presence heartbeat keeps multiple users online", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await heartbeat(alice);
  await heartbeat(bob);
  const response = await heartbeat(carol);

  expect(response.online).toMatchObject({
    [alice.id]: "online",
    [bob.id]: "online",
    [carol.id]: "online",
  });
});

test("presence heartbeat refreshes a user's presence", async () => {
  const alice = await makeUser("alice");

  await heartbeat(alice);

  const response = await heartbeat(alice);

  expect(response.online).toMatchObject({
    [alice.id]: "online",
  });
});

test("user can update their presence status", async () => {
  const alice = await makeUser("alice");

  const response = await updatePresenceStatus(alice, "dnd");
  expect(response.online).toMatchObject({
    [alice.id]: "dnd",
  });

  const updated = await updatePresenceStatus(alice, "online");
  expect(updated.online).toMatchObject({
    [alice.id]: "online",
  });
});

test("user cannot set an invalid presence status", async () => {
  const alice = await makeUser("alice");

  await expect(
    updatePresenceStatus(alice, "invalid" as never),
  ).rejects.toMatchObject({ status: 400 });
});

test("invisible users are not included in the presence heartbeat response", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await updatePresenceStatus(bob, "online");
  const response = await updatePresenceStatus(alice, "invisible");

  expect(response.online).toMatchObject({
    [bob.id]: "online",
  });

  expect(response.online).not.toHaveProperty(alice.id);
});

test("invisible users stay hidden when another user sends a heartbeat", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await updatePresenceStatus(alice, "invisible");
  const response = await heartbeat(bob);

  expect(response.online).not.toHaveProperty(alice.id);
  expect(response.online[bob.id]).toBe("online");
});

test("invisible users reappear in the presence heartbeat response when they change their status", async () => {
  const alice = await makeUser("alice");
  await heartbeat(alice);

  const invisible = await updatePresenceStatus(alice, "invisible");
  expect(invisible.online).not.toHaveProperty(alice.id);

  const backOnline = await updatePresenceStatus(alice, "online");
  expect(backOnline.online).toMatchObject({
    [alice.id]: "online",
  });
});

test("user cannot update another user's presence status", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    bob.pb
      .collection(Collections.Users)
      .update(alice.id, { presenceStatus: "dnd" }),
  ).rejects.toMatchObject({ status: 404 });
});

test("one user's status does not change another user's status", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await updatePresenceStatus(alice, "dnd");
  await updatePresenceStatus(bob, "online");

  const response = await heartbeat(alice);

  expect(response.online[alice.id]).toBe("dnd");
  expect(response.online[bob.id]).toBe("online");
});
