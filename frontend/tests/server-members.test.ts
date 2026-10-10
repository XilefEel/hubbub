import { expect, test } from "vitest";
import {
  addMember,
  makeServer,
  makeServerWithMember,
  makeUser,
} from "./helpers.ts";
import type { ServerMember } from "../src/lib/types.ts";

test("owner can change a member's role", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  const bobMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  const updated = await alice.pb
    .collection<ServerMember>("server_members")
    .update(bobMembership.id, { role: "admin" });

  expect(updated.role).toBe("admin");
});

test("non-owner cannot change a member's role", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  const bobMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  await expect(
    bob.pb.collection<ServerMember>("server_members").update(bobMembership.id, {
      role: "admin",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const after = await alice.pb
    .collection<ServerMember>("server_members")
    .getOne(bobMembership.id);

  expect(after.role).toBe("member");
});

test("owner cannot move a membership to another server", async () => {
  const { alice, bob, server } = await makeServerWithMember();
  const { server: other } = await makeServer(alice);

  const bobMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  await expect(
    alice.pb
      .collection<ServerMember>("server_members")
      .update(bobMembership.id, {
        server: other.id,
      }),
  ).rejects.toMatchObject({ status: 404 });
});

test("member can leave a server", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  const bobMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  await bob.pb
    .collection<ServerMember>("server_members")
    .delete(bobMembership.id);

  await expect(
    alice.pb
      .collection<ServerMember>("server_members")
      .getOne(bobMembership.id),
  ).rejects.toMatchObject({ status: 404 });
});

test("member cannot kick another member", async () => {
  const { alice, bob, server } = await makeServerWithMember();
  const carol = await makeUser("carol");
  await addMember(server.id, carol.id);

  const carolMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${carol.id}"`);

  await expect(
    bob.pb
      .collection<ServerMember>("server_members")
      .delete(carolMembership.id),
  ).rejects.toMatchObject({ status: 404 });

  const stillExists = await alice.pb
    .collection<ServerMember>("server_members")
    .getOne(carolMembership.id);

  expect(stillExists.user).toBe(carol.id);
});

test("owner can kick a member", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  const bobMembership = await alice.pb
    .collection<ServerMember>("server_members")
    .getFirstListItem(`server = "${server.id}" && user = "${bob.id}"`);

  await alice.pb
    .collection<ServerMember>("server_members")
    .delete(bobMembership.id);

  await expect(
    alice.pb
      .collection<ServerMember>("server_members")
      .getOne(bobMembership.id),
  ).rejects.toMatchObject({ status: 404 });
});
