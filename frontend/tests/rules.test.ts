import { test, expect } from "vitest";
import PocketBase from "pocketbase";
import { addMember, makeServer, makeUser } from "./helpers.ts";
import {
  type Server,
  type Channel,
  type Message,
  type Friendship,
} from "../src/lib/types.ts";

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

test("member cannot post as someone else", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);

  await addMember(server.id, bob.id);

  await expect(
    bob.pb.collection<Message>("messages").create({
      channel: channel.id,
      user: alice.id,
      content: "I should not be able to post this as Alice",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("author cannot move their own message to another channel", async () => {
  const alice = await makeUser("alice");

  const { channel: general } = await makeServer(alice);

  const channel2 = await alice.pb.collection<Channel>("channels").create({
    name: "Channel 2",
    server: general.server,
    type: "text",
  });

  const message = await alice.pb.collection<Message>("messages").create({
    channel: general.id,
    user: alice.id,
    content: "This is a message in general",
  });

  await expect(
    alice.pb.collection<Message>("messages").update(message.id, {
      channel: channel2.id,
    }),
  ).rejects.toMatchObject({ status: 404 });

  const afterUpdate = await alice.pb
    .collection<Message>("messages")
    .getOne(message.id);

  expect(afterUpdate.channel).toBe(general.id);
});

test("member cannot edit another member's message", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);

  await addMember(server.id, bob.id);

  const message = await alice.pb.collection<Message>("messages").create({
    channel: channel.id,
    user: alice.id,
    content: "This is Alice's message",
  });

  await expect(
    bob.pb.collection<Message>("messages").update(message.id, {
      content: "Bob tries to edit Alice's message",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const still = await alice.pb
    .collection<Message>("messages")
    .getOne(message.id);

  expect(still.content).toBe("This is Alice's message");
});

test("member cannot delete another member's message", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);
  await addMember(server.id, bob.id);

  const message = await alice.pb.collection<Message>("messages").create({
    channel: channel.id,
    user: alice.id,
    content: "This is Alice's message",
  });

  await expect(
    bob.pb.collection<Message>("messages").delete(message.id),
  ).rejects.toMatchObject({ status: 404 });

  const still = await alice.pb
    .collection<Message>("messages")
    .getOne(message.id);

  expect(still.content).toBe("This is Alice's message");
});

test("user cannot create a new friendship as already accepted", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  await expect(
    alice.pb.collection<Friendship>("friendships").create({
      requester: alice.id,
      addressee: bob.id,
      status: "accepted",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("non-member cannot join a voice channel", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server } = await makeServer(alice);

  const voiceChannel = await alice.pb.collection<Channel>("channels").create({
    name: "Voice Channel",
    server: server.id,
    type: "voice",
  });

  await expect(
    bob.pb.collection("voice_participants").create({
      channel: voiceChannel.id,
      user: bob.id,
    }),
  ).rejects.toMatchObject({ status: 400 });

  const participants = await alice.pb
    .collection("voice_participants")
    .getList(1, 20, { filter: `channel = "${voiceChannel.id}"` });

  expect(participants.items).toHaveLength(0);

  await alice.pb.collection("voice_participants").create({
    channel: voiceChannel.id,
    user: alice.id,
  });

  const participantsAfter = await alice.pb
    .collection("voice_participants")
    .getList(1, 20, { filter: `channel = "${voiceChannel.id}"` });

  expect(participantsAfter.items).toHaveLength(1);
});
