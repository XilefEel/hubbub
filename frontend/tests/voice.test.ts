import { test, expect } from "vitest";
import { makeUser, makeServerWithVoiceChannel } from "./helpers.ts";

test("non-member cannot join a voice channel", async () => {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { voiceChannel } = await makeServerWithVoiceChannel(alice);

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
