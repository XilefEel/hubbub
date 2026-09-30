import PocketBase from "pocketbase";

export const url = "http://127.0.0.1:8091";

export async function makeUser(name: string) {
  const pb = new PocketBase(url);

  const unique = `${name}-${Math.random().toString(36).slice(2, 8)}`;

  const email = `${unique}@test.com`;
  const password = "password123";

  const user = await pb.collection("users").create({
    name: unique,
    email,
    password,
    passwordConfirm: password,
  });

  await pb.collection("users").authWithPassword(email, password);
  return { pb, id: user.id };
}

export async function makeServer(owner: { pb: PocketBase; id: string }) {
  const server = await owner.pb.collection("servers").create({
    name: "Test Server",
    owner: owner.id,
    inviteCode: Math.random().toString(36).slice(2, 10),
  });

  const channel = await owner.pb
    .collection("channels")
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

export async function addMember(serverId: string, userId: string) {
  const a = await admin();
  await a.collection("server_members").create({
    server: serverId,
    user: userId,
    role: "member",
  });
}
