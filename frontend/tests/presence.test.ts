import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import { heartbeat, makeUser, url } from "./helpers.ts";

test("logged-out user cannot send a presence heartbeat", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/presence/heartbeat", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401 });
});

test("authenticated user is included in the presence heartbeat response", async () => {
  const alice = await makeUser("alice");

  const response = await heartbeat(alice);

  expect(response.online).toEqual(expect.arrayContaining([alice.id]));
});

test("presence heartbeat keeps multiple users online", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await heartbeat(alice);
  await heartbeat(bob);
  const response = await heartbeat(carol);

  expect(response.online).toEqual(
    expect.arrayContaining([alice.id, bob.id, carol.id]),
  );
});

test("presence heartbeat refreshes a user's presence", async () => {
  const alice = await makeUser("alice");

  await heartbeat(alice);

  const response = await heartbeat(alice);

  expect(response.online).toEqual(expect.arrayContaining([alice.id]));
});
