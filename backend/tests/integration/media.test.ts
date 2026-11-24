import { strict as assert } from "node:assert";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import sharp from "sharp";
import { createApp } from "../../src/app.js";
import { csrfFor, hashPassword, hashToken, newToken } from "../../src/auth/credentials.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialService } from "../../src/editorial/editorial.js";

const exec = promisify(execFile);

test("media tickets, real image/video bytes, published visibility, range, cleanup and restart", async (t) => {
  assert.equal(process.env.HARNESS_MODE, "test");
  const root = await mkdtemp(join(tmpdir(), "globows-media-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const before = process.env.MEDIA_ROOT;
  process.env.MEDIA_ROOT = root;
  t.after(() => {
    if (before === undefined) delete process.env.MEDIA_ROOT;
    else process.env.MEDIA_ROOT = before;
  });
  const config = loadConfig(process.env);
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  const owner = await db.owner.findUnique({ where: { singleton: true } }) ??
    await db.owner.create({ data: { emailNormalized: "test-media@example.invalid", passwordHash: await hashPassword(newToken()) } });
  const token = newToken();
  const csrf = csrfFor(token);
  await db.session.create({
    data: { ownerId: owner.id, tokenHash: hashToken(token), csrfHash: hashToken(csrf), expiresAt: new Date(Date.now() + 60 * 60_000) },
  });

  let app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  let base = `${await app.getUrl()}/api/v1`;
  const origin = config.appOrigin;
  const admin = { Authorization: `Bearer ${token}`, Origin: origin, "X-Csrf-Token": csrf, "Content-Type": "application/json" };
  const request = (path: string, method = "GET", body?: object) => fetch(`${base}${path}`, {
    method, headers: admin, ...(body && { body: JSON.stringify(body) }),
  });
  const ticket = async (mime: string, size: number, filename = "fixture.png") => {
    const response = await request("/admin/media/upload-ticket", "POST", { mime, size, filename });
    assert.equal(response.status, 201);
    return (await response.json()).token as string;
  };
  const upload = (key: string, mime: string, bytes: Uint8Array, source = origin) => fetch(`${base}/media/upload`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, Origin: source, "Content-Type": mime },
    body: new Uint8Array(bytes),
  });
  const png = await sharp({ create: { width: 24, height: 16, channels: 3, background: "#c05072" } }).png().toBuffer();
  const videoPath = join(root, "generated-fixture.mp4");
  await exec("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=pink:s=32x24:d=0.3",
    "-threads", "1", "-c:v", "libx264", "-pix_fmt", "yuv420p", videoPath], { timeout: 8000 });
  const video = await readFile(videoPath);

  const preflight = await fetch(`${base}/media/upload`, { method: "OPTIONS", headers: {
    Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type",
  } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
  const denied = await fetch(`${base}/media/upload`, { method: "OPTIONS", headers: { Origin: "https://example.invalid" } });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal((await request("/admin/media/upload-ticket", "POST", { mime: "image/svg+xml", size: 12, filename: "fixture.svg" })).status, 415);
  assert.equal((await request("/admin/media/upload-ticket", "POST", { mime: "image/png", size: 15 * 1024 ** 2 + 1, filename: "fixture.png" })).status, 413);
  assert.equal((await request("/admin/media/upload-ticket", "POST", { mime: "video/mp4", size: 100 * 1024 ** 2 + 1, filename: "fixture.mp4" })).status, 413);
  assert.equal((await request("/admin/media/upload-ticket", "POST", { mime: "image/png", size: 12, filename: "folder/fixture.png" })).status, 422);
  assert.equal((await upload(await ticket("image/png", png.length - 1), "image/png", png)).status, 413);
  const invalid = Buffer.from("fixture sin bytes de imagen");
  assert.equal((await upload(await ticket("image/png", invalid.length), "image/png", invalid)).status, 415);
  const expired = await ticket("image/png", png.length);
  await db.uploadTicket.update({ where: { tokenHash: hashToken(expired) }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await upload(expired, "image/png", png)).status, 401);

  const key = await ticket("image/png", png.length);
  assert.equal((await upload(key, "image/png", png, "https://example.invalid")).status, 403);
  const photoResponse = await upload(key, "image/png", png);
  assert.equal(photoResponse.status, 201);
  const photo = await photoResponse.json();
  assert.equal(photo.width, 24);
  assert.equal(photo.height, 16);
  assert.equal((await upload(key, "image/png", png)).status, 401);
  assert.equal((await fetch(`${base}/media/public/${photo.id}`)).status, 404);
  assert.equal((await fetch(`${base}/media/preview/${photo.id}`)).status, 401);
  assert.equal((await fetch(`${base}/media/public/not-an-id`)).status, 400);

  const privateTicket = await (await request(`/admin/media/${photo.id}/preview-ticket`, "POST", {})).json();
  const privateResponse = await fetch(`${base}/media/preview/${photo.id}?ticket=${privateTicket.token}`);
  assert.equal(privateResponse.status, 200);
  assert.equal(privateResponse.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(privateResponse.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(Buffer.from(await privateResponse.arrayBuffer()), png);

  const clipResponse = await upload(await ticket("video/mp4", video.length, "fixture.mp4"), "video/mp4", video);
  assert.equal(clipResponse.status, 201);
  const clip = await clipResponse.json();
  assert.equal(clip.mime, "video/mp4");
  assert.equal(clip.width, 32);

  const cms = new EditorialService(db);
  const actor = { actorId: owner.id, requestId: randomUUID() };
  const training = await cms.create("TRAINING", {
    slug: `media-${randomUUID()}`,
    payload: { title: "Formación de prueba", description: "Fixture", trainingType: "COURSE",
      ctaInterest: "cursos", videoRef: clip.id, photoRef: photo.id },
  }, actor);
  await cms.transition(training, training.version, "PUBLISH", actor);

  const mediaUrl = () => `${base}/media/public/${clip.id}`;
  const requested = await fetch(mediaUrl(), { headers: { Range: "bytes=0-7" } });
  assert.equal(requested.status, 206);
  assert.equal(requested.headers.get("Content-Range"), `bytes 0-7/${video.length}`);
  assert.deepEqual(Buffer.from(await requested.arrayBuffer()), video.subarray(0, 8));
  assert.equal((await fetch(mediaUrl(), { headers: { Range: `bytes=${video.length}-` } })).status, 416);
  assert.equal((await fetch(mediaUrl(), { method: "HEAD" })).headers.get("Content-Length"), String(video.length));

  assert.equal((await request(`/admin/media/${clip.id}`, "DELETE", { version: clip.version })).status, 409);
  assert.equal((await request(`/admin/media/${photo.id}`, "PATCH", { version: photo.version, alt: "Foto", title: "Ficha", retire: true })).status, 409);
  const edit = await request(`/admin/media/${photo.id}`, "PATCH", { version: photo.version, alt: "Foto de prueba", title: "Fixture" });
  assert.equal(edit.status, 200);
  assert.equal((await edit.json()).alt, "Foto de prueba");
  assert.equal((await request("/admin/media?type=video")).status, 200);

  const orphan = join(root, `${randomUUID()}.tmp`);
  await writeFile(orphan, "orphan");
  const old = new Date(Date.now() - 25 * 60 * 60_000);
  await utimes(orphan, old, old);
  const report = await exec(process.execPath, ["dist/src/media/cleanup-cli.js", "--dry-run"]);
  assert.equal(JSON.parse(report.stdout).candidates.length, 1);
  assert.equal((await stat(orphan)).size, 6);

  await app.close();
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  base = `${await app.getUrl()}/api/v1`;
  const persisted = await fetch(mediaUrl());
  assert.equal(persisted.status, 200);
  assert.deepEqual(Buffer.from(await persisted.arrayBuffer()), video);
  const spare = await (await upload(await ticket("image/png", png.length), "image/png", png)).json();
  assert.equal((await request(`/admin/media/${spare.id}`, "DELETE", { version: spare.version })).status, 200);
  assert.equal((await request(`/admin/media/${spare.id}`)).status, 404);
});
