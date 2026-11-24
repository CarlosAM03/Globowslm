import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createApp } from "../../src/app.js";
import { csrfFor, hashPassword, hashToken, newToken } from "../../src/auth/credentials.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialService } from "../../src/editorial/editorial.js";
import { ContentKind } from "../../src/generated/prisma/client.js";

test("publication history is protected and restoring an older revision preserves the active snapshot", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  const cms = new EditorialService(db);
  const owner = await db.owner.findUnique({ where: { singleton: true } }) ??
    await db.owner.create({ data: { emailNormalized: "test-publications@example.invalid", passwordHash: await hashPassword(newToken()) } });
  const token = newToken();
  const csrf = csrfFor(token);
  await db.session.create({ data: {
    ownerId: owner.id, tokenHash: hashToken(token), csrfHash: hashToken(csrf), expiresAt: new Date(Date.now() + 3_600_000),
  } });
  const actor = () => ({ actorId: owner.id, requestId: randomUUID() });
  const prefix = randomUUID();
  const category = await cms.create(ContentKind.BLOG_CATEGORY, { slug: `historia-${prefix}`, payload: { title: "Historia fixture" } }, actor());
  const activeCategory = await cms.transition(category, category.version, "PUBLISH", actor());
  const slug = `revision-${prefix}`;
  const before = {
    title: "Primera revisión", excerpt: "Resumen fixture", categoryRefs: [category.id], tags: [],
    blocks: [{ type: "paragraph", text: "Contenido de prueba" }],
  };
  const entry = await cms.create(ContentKind.POST, { slug, position: 2, payload: before }, actor());
  const first = await cms.transition(entry, entry.version, "PUBLISH", actor());
  const after = { ...before, title: "Segunda revisión", categoryRefs: [] };
  const edited = await cms.edit(entry, first.version, { slug, position: 7, payload: after }, actor());
  const second = await cms.transition(entry, edited.version, "PUBLISH", actor());

  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const base = `${await app.getUrl()}/api/v1/admin`;
  const route = `/content/post/${entry.id}/revisions`;
  const auth = { Origin: config.appOrigin, Authorization: `Bearer ${token}`, "X-CSRF-Token": csrf, "Content-Type": "application/json" };
  const request = (path: string, method = "GET", data?: object) => fetch(base + path, {
    method, headers: auth, ...(data && { body: JSON.stringify(data) }),
  });
  assert.equal((await fetch(base + route)).status, 401);
  assert.equal((await fetch(`${base}/publications`)).status, 401);
  const list = await request("/publications?kind=post&state=PUBLISHED");
  assert.equal(list.status, 200);
  const { items } = await list.json();
  assert.ok(items.every((row: { kind: string; state: string }) => row.kind === "POST" && row.state === "PUBLISHED"));
  const listed = items.find((row: { id: string }) => row.id === entry.id);
  assert.equal(listed.title, "Segunda revisión");
  assert.equal(Object.hasOwn(listed, "payload"), false);

  const history = await request(route);
  assert.equal(history.status, 200);
  assert.deepEqual((await history.json()).items.map((row: { revisionNo: number; active: boolean }) =>
    [row.revisionNo, row.active]), [[2, true], [1, false]]);
  assert.deepEqual((await (await request(`${route}/1`)).json()).payload, before);
  assert.equal((await request(`${route}/9`)).status, 404);
  assert.equal((await request(`${route}/1/restore`, "POST", { version: first.version })).status, 409);

  const archived = await cms.transition(category, activeCategory.version, "ARCHIVE", actor());
  assert.equal((await request(`${route}/1/restore`, "POST", { version: second.version })).status, 409);
  const unchanged = await cms.draft(entry);
  assert.equal(unchanged.version, second.version);
  assert.deepEqual(unchanged.draftPayload, after);
  assert.equal(await db.auditEvent.count({ where: { entityId: entry.id, action: "RESTORE_REVISION" } }), 0);

  const recovered = await cms.transition(category, archived.version, "RESTORE", actor());
  await cms.transition(category, recovered.version, "PUBLISH", actor());
  const restored = await request(`${route}/1/restore`, "POST", { version: second.version });
  assert.equal(restored.status, 200);
  assert.deepEqual((await restored.json()).payload, before);
  assert.equal((await cms.draft(entry)).position, 2);
  assert.deepEqual((await cms.published(ContentKind.POST, slug))?.payload, after);
  assert.equal(await db.revision.count({ where: { entryId: entry.id } }), 2);
  assert.equal(await db.auditEvent.count({ where: { entityId: entry.id, action: "RESTORE_REVISION", actorId: owner.id } }), 1);
});
