import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createApp } from "../../src/app.js";
import { csrfFor, hashPassword, hashToken, newToken } from "../../src/auth/credentials.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialService } from "../../src/editorial/editorial.js";
import { ContentKind } from "../../src/generated/prisma/client.js";

test("presential training exposes a protected workflow, contextual CTA and typed optional references", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  const owner = await db.owner.findUnique({ where: { singleton: true } }) ??
    await db.owner.create({ data: { emailNormalized: "test-training@example.invalid", passwordHash: await hashPassword(newToken()) } });
  const token = newToken();
  const csrf = csrfFor(token);
  await db.session.create({ data: {
    ownerId: owner.id, tokenHash: hashToken(token), csrfHash: hashToken(csrf), expiresAt: new Date(Date.now() + 3_600_000),
  } });
  const asset = (mime: string) => db.media.create({ data: {
    storageKey: randomUUID(), originalName: "fixture", mime, sha256: "2".repeat(64), size: 123, status: "READY",
  } });
  const [photo, video] = await Promise.all([asset("image/png"), asset("video/mp4")]);

  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const route = `${await app.getUrl()}/api/v1/admin/content/training`;
  const headers = { Origin: config.appOrigin, Authorization: `Bearer ${token}`, "X-CSRF-Token": csrf, "Content-Type": "application/json" };
  const request = (path: string, method = "GET", body?: object) => fetch(route + path, {
    method, headers, ...(body && { body: JSON.stringify(body) }),
  });

  const slug = `taller-${randomUUID()}`;
  const payload = {
    title: "Taller fixture", description: "Oferta presencial de prueba", trainingType: "WORKSHOP",
    ctaInterest: "talleres", photoRef: photo.id, videoRef: video.id,
  };
  assert.equal((await fetch(route)).status, 401);
  assert.equal((await request("", "POST", { slug, payload: { ...payload, trainingType: "ONLINE" } })).status, 422);
  assert.equal((await request("", "POST", { slug, payload: { ...payload, enrollmentUrl: "https://example.invalid" } })).status, 422);
  assert.equal((await request("", "POST", { slug, payload: { ...payload, photoRef: video.id } })).status, 409);
  assert.equal((await request("", "POST", { slug, payload: { ...payload, ctaInterest: "unknown" } })).status, 422);
  const created = await request("", "POST", { slug, payload });
  assert.equal(created.status, 201);
  const draft = await created.json();
  assert.equal(draft.state, "DRAFT");
  const preview = await request(`/${draft.id}/preview`);
  assert.equal(preview.status, 200);
  assert.deepEqual((await preview.json()).payload, payload);

  const cms = new EditorialService(db);
  assert.equal(await cms.published(ContentKind.TRAINING, slug), null);
  const publishing = await request(`/${draft.id}/publish`, "POST", { version: draft.version });
  assert.equal(publishing.status, 200);
  const published = await publishing.json();
  assert.deepEqual((await cms.published(ContentKind.TRAINING, slug))?.payload, payload);

  const editedPayload = { ...payload, trainingType: "ADVICE", ctaInterest: "asesorias", photoRef: undefined, videoRef: undefined };
  const edited = await request(`/${draft.id}`, "PATCH", { slug, version: published.version, payload: editedPayload });
  assert.equal(edited.status, 200);
  const update = await edited.json();
  assert.deepEqual((await cms.published(ContentKind.TRAINING, slug))?.payload, payload);
  const republish = await request(`/${draft.id}/publish`, "POST", { version: update.version });
  assert.equal(republish.status, 200);
  assert.equal((await republish.json()).payload.ctaInterest, "asesorias");
  assert.equal((await cms.published(ContentKind.TRAINING, slug))?.position, 0);
});
