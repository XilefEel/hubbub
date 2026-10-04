import PocketBase from "pocketbase";
import type {
  Server,
  Channel,
  ServerMember,
  ServerRole,
} from "../src/lib/types.ts";

export const url = "http://127.0.0.1:8091";

export async function makeUser(name: string) {
  const pb = new PocketBase(url);

  const uniqueName = `${name}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${uniqueName}@test.com`;
  const password = "password123";

  const user = await pb.collection("users").create({
    name: uniqueName,
    email,
    password,
    passwordConfirm: password,
  });

  await pb.collection("users").authWithPassword(email, password);
  return { pb, id: user.id };
}

export async function makeServer(owner: { pb: PocketBase; id: string }) {
  const server = await owner.pb.collection<Server>("servers").create({
    name: `${owner.id}'s Server`,
    owner: owner.id,
    inviteCode: Math.random().toString(36).slice(2, 10),
  });

  const channel = await owner.pb
    .collection<Channel>("channels")
    .getFirstListItem(`server = "${server.id}"`);

  return { server, channel };
}

export async function admin() {
  const pb = new PocketBase(url);
  await pb
    .collection("_superusers")
    .authWithPassword("admin@test.com", "adminpass123");

  return pb;
}

export async function addMember(
  serverId: string,
  userId: string,
  role: ServerRole = "member",
) {
  const a = await admin();

  await a.collection<ServerMember>("server_members").create({
    server: serverId,
    user: userId,
    role,
  });
}

export async function makeServerWithMember() {
  const alice = await makeUser("alice");
  const bob = await makeUser("bob");

  const { server, channel } = await makeServer(alice);
  await addMember(server.id, bob.id);

  return { alice, bob, server, channel };
}
