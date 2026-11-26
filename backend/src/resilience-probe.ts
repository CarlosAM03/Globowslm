import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile, rm, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig } from "./config.js";

const config = loadConfig(process.env);
assert.equal(config.mode, "local");
assert.equal(process.env.RESILIENCE_PROBE, "1");
assert.equal(new URL(config.databaseUrl).hostname, "db");
const base = `http://127.0.0.1:${config.port}/api/v1`;
const tokenFile = "/tmp/globows-resilience-session";
const orphanFile = "/tmp/globows-resilience-orphan";

function api(path: string, init?: RequestInit) {
  return fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(4500) });
}

async function ready(expected = true) {
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const [live, check] = await Promise.all([api("/health/live"), api("/health/ready")]);
      if (live.status === 200 && check.status === (expected ? 200 : 503)) return;
    } catch {
      // A newly started container can take a moment to start listening.
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error("El estado de salud no alcanzó la condición esperada.");
}

async function verifySnapshot() {
  await ready();
  const manifest = JSON.parse(await readFile("/app/fixtures/v1.json", "utf8"));
  const { id, sha256 } = manifest.media.find((item: { path: string }) => item.path.startsWith("images/hero/"));
  const siteResponse = await api("/public/site");
  assert.equal(siteResponse.status, 200);
  const content = await siteResponse.json();
  assert.equal(content.site.hero.photo.id, id);
  assert.equal(content.services.length, 5);
  assert.equal(content.certifications.length, 0);
  const photo = await api(`/media/public/${id}`);
  assert.equal(photo.status, 200);
  assert.equal(photo.headers.get("content-type"), "image/webp");
  const digest = createHash("sha256").update(Buffer.from(await photo.arrayBuffer())).digest("hex");
  assert.equal(digest, sha256);
  const blog = await api("/public/posts");
  assert.equal(blog.status, 200);
  assert.equal((await blog.json()).items.length, 0);
  console.log(JSON.stringify({ event: "snapshot_and_media_ok", services: content.services.length, mediaSha256: digest }));
}

async function login() {
  const origin = config.appOrigin;
  const challenge = await api("/auth/csrf", { headers: { Origin: origin } });
  assert.equal(challenge.status, 200);
  const { csrfToken } = await challenge.json();
  const response = await api("/auth/login", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify({ email: process.env.HARNESS_OWNER_EMAIL, password: process.env.HARNESS_OWNER_PASSWORD }),
  });
  assert.equal(response.status, 200);
  const { sessionToken } = await response.json();
  assert.match(sessionToken, /^[A-Za-z0-9_-]{43}$/);
  return sessionToken as string;
}

async function session(token: string, expected: number) {
  const response = await api("/auth/session", { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, expected);
}

async function run() {
  switch (process.argv[2]) {
    case "healthy":
      await verifySnapshot();
      return;
    case "database-down":
      await ready(false);
      console.log(JSON.stringify({ event: "database_outage_detected" }));
      return;
    case "capture-session": {
      const token = await login();
      await session(token, 200);
      await writeFile(tokenFile, token, { mode: 0o600, flag: "wx" });
      return;
    }
    case "verify-recovery":
      try {
        await session(await readFile(tokenFile, "utf8"), 401);
        await session(await login(), 200);
        console.log(JSON.stringify({ event: "owner_recovered_previous_session_revoked" }));
      } finally {
        await rm(tokenFile, { force: true });
      }
      return;
    case "create-orphan": {
      const name = `${randomUUID()}.tmp`;
      const path = join(config.mediaRoot, name);
      await writeFile(path, "resilience fixture", { flag: "wx", mode: 0o600 });
      const past = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await utimes(path, past, past);
      await writeFile(orphanFile, name, { flag: "wx", mode: 0o600 });
      return;
    }
    case "check-orphan": {
      const name = await readFile(orphanFile, "utf8");
      assert.equal(await readFile(join(config.mediaRoot, name), "utf8"), "resilience fixture");
      console.log(JSON.stringify({ event: "orphan_unchanged", name }));
      return;
    }
    default:
      throw new Error("Operación de prueba inválida.");
  }
}

try {
  await run();
} catch {
  console.error(JSON.stringify({ event: "resilience_probe_failed", operation: process.argv[2] }));
  process.exitCode = 1;
}
