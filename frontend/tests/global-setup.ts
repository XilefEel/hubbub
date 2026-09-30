import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

let pb: ChildProcess;

const env = {
  ...process.env,
  LIVEKIT_URL: "ws://localhost:7881",
  LIVEKIT_API_KEY: "test",
  LIVEKIT_API_SECRET: "test-secret-test-secret-test-secret",
};

const ROOT = process.cwd();
const BACKEND = path.resolve(ROOT, "../backend");
const DIR = path.resolve(ROOT, ".test_pb_data");
const BIN = path.resolve(
  ROOT,
  process.platform === "win32" ? ".test_pb_bin.exe" : ".test_pb_bin",
);

export async function setup() {
  rmSync(DIR, { recursive: true, force: true });

  execFileSync("go", ["build", "-o", BIN, "."], {
    cwd: BACKEND,
    stdio: "inherit",
  });

  execFileSync(BIN, [
    "superuser",
    "upsert",
    "admin@test.com",
    "adminpass123",
    "--dir",
    DIR,
  ]);

  pb = spawn(BIN, ["serve", "--dir", DIR, "--http", "127.0.0.1:8091"], {
    cwd: BACKEND,
    env,
    stdio: "inherit",
  });

  pb.on("error", (err) => console.error("spawn error:", err));
  pb.on("exit", (code, signal) =>
    console.error("PocketBase exited:", code, signal),
  );

  let lastError: unknown;

  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch("http://127.0.0.1:8091/api/health");
      console.log("health check status:", res.status);
      if (res.ok) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.error("last fetch error:", lastError);
  throw new Error("PocketBase did not start");
}

export async function teardown() {
  pb.kill();
}
