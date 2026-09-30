import { test, expect } from "vitest";
import PocketBase from "pocketbase";

test("logged-out user cannot create a server", async () => {
  const pb = new PocketBase("http://127.0.0.1:8091");

  await expect(
    pb.collection("servers").create({ name: "My Server" }),
  ).rejects.toMatchObject({ status: 400 });
});
