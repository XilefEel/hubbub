import { test, expect } from "vitest";
import { makeUser } from "./helpers.ts";
import { Collections } from "../src/lib/collections.ts";

test("user cannot create a new friendship as already accepted", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    alice.pb.collection(Collections.Friendships).create({
      requester: alice.id,
      addressee: bob.id,
      status: "accepted",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("addressee can accept a friendship request", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const friendship = await alice.pb.collection(Collections.Friendships).create({
    requester: alice.id,
    addressee: bob.id,
    status: "pending",
  });

  await expect(
    bob.pb.collection(Collections.Friendships).update(friendship.id, {
      status: "accepted",
    }),
  ).resolves.toBeTruthy();

  const accepted = await bob.pb
    .collection(Collections.Friendships)
    .getOne(friendship.id);

  expect(accepted.status).toBe("accepted");
});

test("requester cannot accept their own friendship request", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const friendship = await alice.pb.collection(Collections.Friendships).create({
    requester: alice.id,
    addressee: bob.id,
    status: "pending",
  });

  await expect(
    alice.pb.collection(Collections.Friendships).update(friendship.id, {
      status: "accepted",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const after = await bob.pb
    .collection(Collections.Friendships)
    .getOne(friendship.id);

  expect(after.status).toBe("pending");
});

test("addressee cannot change who the friendship is between", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  const friendship = await alice.pb.collection(Collections.Friendships).create({
    requester: alice.id,
    addressee: bob.id,
    status: "pending",
  });

  await expect(
    bob.pb.collection(Collections.Friendships).update(friendship.id, {
      requester: carol.id,
    }),
  ).rejects.toMatchObject({ status: 404 });
});
