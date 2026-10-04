import { test, expect } from "vitest";
import { makeUser } from "./helpers.ts";
import { type Friendship } from "../src/lib/types.ts";

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
