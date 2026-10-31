import { expect, test } from "vitest";
import PocketBase from "pocketbase";
import type { Conversation } from "../src/lib/types.ts";
import {
  addMember,
  getConversationMembers,
  makeFriends,
  makeServer,
  makeUser,
  url,
} from "./helpers.ts";

test("logged-out user cannot open a dm", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const unauthenticated = new PocketBase(url);

  await expect(
    unauthenticated.send("/api/dms/open", {
      method: "POST",
      body: { userId: bob.id },
    }),
  ).rejects.toMatchObject({ status: 401 });

  expect(alice.id).not.toBe(bob.id);
});

test("user cannot open a dm with themselves", async () => {
  const alice = await makeUser("alice");

  await expect(
    alice.pb.send("/api/dms/open", {
      method: "POST",
      body: { userId: alice.id },
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("unrelated users cannot open a dm", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    alice.pb.send("/api/dms/open", {
      method: "POST",
      body: { userId: bob.id },
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("users who share a server can open and reuse a dm", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server } = await makeServer(alice);
  await addMember(server.id, bob.id);

  const first = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  const second = await bob.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: alice.id },
    },
  );

  expect(second.conversationId).toBe(first.conversationId);

  const members = await getConversationMembers(alice.pb, first.conversationId);

  expect(members.map((member) => member.user).sort()).toEqual(
    [alice.id, bob.id].sort(),
  );
});

test("friends can open a dm", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  await makeFriends(alice, bob);

  const response = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/open",
    {
      method: "POST",
      body: { userId: bob.id },
    },
  );

  const conversation = await alice.pb
    .collection<Conversation>("conversations")
    .getOne(response.conversationId);

  expect(conversation.isGroup).toBe(false);

  const members = await getConversationMembers(
    alice.pb,
    response.conversationId,
  );

  expect(members.map((member) => member.user)).toEqual(
    expect.arrayContaining([alice.id, bob.id]),
  );
});

test("dm groups must have at least three people including the creator", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  await makeFriends(alice, bob);

  await expect(
    alice.pb.send("/api/dms/group", {
      method: "POST",
      body: { userIds: [bob.id], name: "Too Small" },
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("dm groups cannot have more than ten people including the creator", async () => {
  const users = await Promise.all(
    Array.from({ length: 11 }, (_, index) => makeUser(`group-${index}`)),
  );

  for (const user of users.slice(1)) {
    await makeFriends(users[0], user);
  }

  await expect(
    users[0].pb.send("/api/dms/group", {
      method: "POST",
      body: { userIds: users.slice(1).map((user) => user.id) },
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("dm groups only allow friends", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");
  const dave = await makeUser("dave");

  await makeFriends(alice, bob);
  await makeFriends(alice, carol);

  await expect(
    alice.pb.send("/api/dms/group", {
      method: "POST",
      body: { userIds: [bob.id, dave.id, carol.id], name: "Friends" },
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("dm groups deduplicate members", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await makeFriends(alice, bob);
  await makeFriends(alice, carol);

  const response = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/group",
    {
      method: "POST",
      body: {
        userIds: [alice.id, bob.id, bob.id, carol.id],
        name: "Friends",
      },
    },
  );

  const members = await getConversationMembers(
    alice.pb,
    response.conversationId,
  );

  expect(members).toHaveLength(3);

  expect(members.map((member) => member.user).sort()).toEqual(
    [alice.id, bob.id, carol.id].sort(),
  );
});

test("only the group owner can rename the group or add members", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");
  const dave = await makeUser("dave");

  await makeFriends(alice, bob);
  await makeFriends(alice, carol);
  await makeFriends(alice, dave);

  const created = await alice.pb.send<{ conversationId: string }>(
    "/api/dms/group",
    {
      method: "POST",
      body: { userIds: [bob.id, carol.id], name: "Original" },
    },
  );

  await expect(
    bob.pb.send(`/api/dms/group/${created.conversationId}`, {
      method: "PATCH",
      body: { name: "Unauthorized" },
    }),
  ).rejects.toMatchObject({ status: 403 });

  const updated = await alice.pb.send<{ conversationId: string }>(
    `/api/dms/group/${created.conversationId}`,
    {
      method: "PATCH",
      body: { name: "Renamed", userIds: [dave.id] },
    },
  );

  expect(updated.conversationId).toBe(created.conversationId);

  const conversation = await alice.pb
    .collection<Conversation>("conversations")
    .getOne(created.conversationId);

  expect(conversation.name).toBe("Renamed");

  const members = await getConversationMembers(
    alice.pb,
    created.conversationId,
  );

  expect(members.map((member) => member.user)).toEqual(
    expect.arrayContaining([alice.id, bob.id, carol.id, dave.id]),
  );
});
