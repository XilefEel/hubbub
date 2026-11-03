import PocketBase from "pocketbase";
import { expect, test } from "vitest";
import { makeUser, url } from "./helpers.ts";

test("logged-out user cannot send a presence heartbeat", async () => {
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/presence/heartbeat", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401 });
});

test("authenticated user is included in the presence heartbeat response", async () => {
  const alice = await makeUser("alice");

  const response = await alice.pb.send<{ online: string[] }>(
    "/api/presence/heartbeat",
    { method: "POST" },
  );

  expect(response.online).toEqual(expect.arrayContaining([alice.id]));
});

test("presence heartbeat keeps multiple users online", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const carol = await makeUser("carol");

  await alice.pb.send("/api/presence/heartbeat", { method: "POST" });

  await bob.pb.send("/api/presence/heartbeat", { method: "POST" });

  const response = await carol.pb.send<{ online: string[] }>(
    "/api/presence/heartbeat",
    { method: "POST" },
  );

  expect(response.online).toEqual(
    expect.arrayContaining([alice.id, bob.id, carol.id]),
  );
});

test("presence heartbeat refreshes a user's presence", async () => {
  const alice = await makeUser("alice");

  await alice.pb.send("/api/presence/heartbeat", { method: "POST" });

  const response = await alice.pb.send<{ online: string[] }>(
    "/api/presence/heartbeat",
    { method: "POST" },
  );

  expect(response.online).toEqual(expect.arrayContaining([alice.id]));
});
