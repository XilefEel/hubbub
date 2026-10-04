import { expect, test } from "vitest";
import { makeServer, makeServerWithMember } from "./helpers.ts";
import type { Channel } from "../src/lib/types.ts";

test("regular members cannot create a channel", async () => {
  const { alice, bob, server } = await makeServerWithMember();

  await expect(
    bob.pb.collection<Channel>("channels").create({
      name: "Bob's Channel",
      server: server.id,
      type: "text",
    }),
  ).rejects.toMatchObject({ status: 400 });

  const channels = await alice.pb
    .collection<Channel>("channels")
    .getFullList(200, {
      filter: `server = "${server.id}"`,
    });

  expect(channels.length).toBe(1);
});

test("regular members cannot update a channel", async () => {
  const { alice, bob, channel } = await makeServerWithMember();

  await expect(
    bob.pb.collection<Channel>("channels").update(channel.id, {
      name: "Bob's Channel",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const general = await alice.pb
    .collection<Channel>("channels")
    .getOne(channel.id);

  expect(general.name).toBe(channel.name);
});

test("regular members cannot delete a channel", async () => {
  const { alice, bob, server, channel } = await makeServerWithMember();

  await expect(
    bob.pb.collection<Channel>("channels").delete(channel.id),
  ).rejects.toMatchObject({ status: 404 });

  const channels = await alice.pb
    .collection<Channel>("channels")
    .getFullList(200, {
      filter: `server = "${server.id}"`,
    });

  expect(channels.length).toBe(1);
});

test("owner can create, update and delete a channel", async () => {
  const { alice, server } = await makeServerWithMember();

  const created = await alice.pb.collection<Channel>("channels").create({
    name: "Alice's Channel",
    server: server.id,
    type: "text",
  });

  expect(created.name).toBe("Alice's Channel");

  const updated = await alice.pb
    .collection<Channel>("channels")
    .update(created.id, { name: "Renamed" });

  expect(updated.name).toBe("Renamed");

  await alice.pb.collection<Channel>("channels").delete(created.id);

  await expect(
    alice.pb.collection<Channel>("channels").getOne(created.id),
  ).rejects.toMatchObject({ status: 404 });
});

test("owner cannot move a channel to another server", async () => {
  const { alice, channel } = await makeServerWithMember();
  const { server: other } = await makeServer(alice);

  await expect(
    alice.pb.collection<Channel>("channels").update(channel.id, {
      server: other.id,
    }),
  ).rejects.toMatchObject({ status: 404 });
});
