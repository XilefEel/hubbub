import { test, expect } from "vitest";
import {
  makeUser,
  makeServer,
  makeServerWithMember,
  makeTextChannel,
  sendMessageInChannel,
} from "./helpers.ts";
import { Collections } from "../src/lib/collections.ts";

test("member cannot post as someone else", async () => {
  const { alice, bob, channel } = await makeServerWithMember();

  await expect(
    bob.pb.collection(Collections.Messages).create({
      channel: channel.id,
      user: alice.id,
      content: "I should not be able to post this as Alice",
    }),
  ).rejects.toMatchObject({ status: 400 });
});

test("author cannot move their own message to another channel", async () => {
  const alice = await makeUser("alice");
  const { channel: general } = await makeServer(alice);

  const channel2 = await makeTextChannel(alice, general.server, "channel-2");

  const message = await sendMessageInChannel(
    alice,
    general.id,
    "This is a message in the general channel",
  );

  await expect(
    alice.pb.collection(Collections.Messages).update(message.id, {
      channel: channel2.id,
    }),
  ).rejects.toMatchObject({ status: 404 });

  const afterUpdate = await alice.pb
    .collection(Collections.Messages)
    .getOne(message.id);

  expect(afterUpdate.channel).toBe(general.id);
});

test("member cannot edit another member's message", async () => {
  const { alice, bob, channel } = await makeServerWithMember();

  const message = await sendMessageInChannel(
    alice,
    channel.id,
    "This is Alice's message",
  );

  await expect(
    bob.pb.collection(Collections.Messages).update(message.id, {
      content: "Bob tries to edit Alice's message",
    }),
  ).rejects.toMatchObject({ status: 404 });

  const still = await alice.pb
    .collection(Collections.Messages)
    .getOne(message.id);

  expect(still.content).toBe("This is Alice's message");
});

test("non-member cannot read messages in a server", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { channel } = await makeServer(alice);

  sendMessageInChannel(alice, channel.id, "secret message");

  const messagesForBob = await bob.pb
    .collection(Collections.Messages)
    .getList(1, 20, {
      filter: `channel = "${channel.id}"`,
    });

  expect(messagesForBob.items).toHaveLength(0);

  const messagesForAlice = await alice.pb
    .collection(Collections.Messages)
    .getList(1, 20, {
      filter: `channel = "${channel.id}"`,
    });

  expect(messagesForAlice.items).toHaveLength(1);
});

test("member cannot delete another member's message", async () => {
  const { alice, bob, channel } = await makeServerWithMember();

  const message = await sendMessageInChannel(
    alice,
    channel.id,
    "This is Alice's message",
  );

  await expect(
    bob.pb.collection(Collections.Messages).delete(message.id),
  ).rejects.toMatchObject({ status: 404 });

  const still = await alice.pb
    .collection(Collections.Messages)
    .getOne(message.id);

  expect(still.content).toBe("This is Alice's message");
});
