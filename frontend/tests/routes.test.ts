import { expect, test } from "vitest";
import PocketBase from "pocketbase";
import { makeServer, makeUser, url } from "./helpers.ts";
import type { ServerMember } from "../src/lib/types.ts";

test("logged-out user cannot join a server", async () => {
  const alice = await makeUser("alice");
  const { server } = await makeServer(alice);
  const pb = new PocketBase(url);

  await expect(
    pb.send("/api/servers/join", {
      method: "POST",
      body: { inviteCode: server.inviteCode },
    }),
  ).rejects.toMatchObject({ status: 401 });
});

test("user can join a server with a valid invite code", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const { server } = await makeServer(alice);

  const res = await bob.pb.send("/api/servers/join", {
    method: "POST",
    body: { inviteCode: server.inviteCode },
  });

  expect(res.server.id).toBe(server.id);

  const membership = await bob.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  expect(membership.role).toBe("member");
});

test("cannot join a server with an invalid invite code", async () => {
  const bob = await makeUser("bob");

  await expect(
    bob.pb.send("/api/servers/join", {
      method: "POST",
      body: { inviteCode: "does-not-exist" },
    }),
  ).rejects.toMatchObject({ status: 404 });
});

test("rejected when no invite code is provided", async () => {
  const bob = await makeUser("bob");

  await expect(
    bob.pb.send("/api/servers/join", { method: "POST", body: {} }),
  ).rejects.toMatchObject({ status: 400 });
});

test("user cannot join the same server twice", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const { server } = await makeServer(alice);

  await bob.pb.send("/api/servers/join", {
    method: "POST",
    body: { inviteCode: server.inviteCode },
  });

  await expect(
    bob.pb.send("/api/servers/join", {
      method: "POST",
      body: { inviteCode: server.inviteCode },
    }),
  ).rejects.toMatchObject({ status: 400 });

  const memberships = await bob.pb
    .collection<ServerMember>("server_members")
    .getFullList({ filter: `server = "${server.id}" && user = "${bob.id}"` });

  expect(memberships).toHaveLength(1);
});

test("owner cannot rejoin their own server", async () => {
  const alice = await makeUser("alice");
  const { server } = await makeServer(alice);

  await expect(
    alice.pb.send("/api/servers/join", {
      method: "POST",
      body: { inviteCode: server.inviteCode },
    }),
  ).rejects.toMatchObject({ status: 400 });
});
