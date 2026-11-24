import { strict as assert } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { hashPassword, newToken } from "../../src/auth/credentials.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialService } from "../../src/editorial/editorial.js";
import { importV1 } from "../../src/editorial/import-v1.js";

const sum = (text: string) => createHash("sha256").update(text).digest("hex");

test("V1 import plans, applies once and preserves an edited draft when its source changes", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const root = await mkdtemp(join(tmpdir(), "globows-import-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  const owner = await db.owner.findUnique({ where: { singleton: true } }) ??
    await db.owner.create({ data: { emailNormalized: "test-import@example.invalid", passwordHash: await hashPassword(newToken()) } });
  const approved = JSON.parse(await readFile("fixtures/v1.json", "utf8"));
  const media = { ...approved.media[0], id: randomUUID() };
  const id = randomUUID();
  const slug = `import-${id}`;
  const origin = {
    kind: "TRAINING", sourceKey: `v1:training:${id}`, source: "Fixture QA de importación", slug,
    position: 2, payload: {
      title: "Fuente aprobada de prueba", description: "Fixture local.", trainingType: "COURSE", ctaInterest: "cursos", photoRef: media.id,
    },
  };
  const fixture = (entry: typeof origin) => ({ version: 1, media: [media], records: [{ id, hash: sum(JSON.stringify(entry)), ...entry }] });
  const run = (apply: boolean, entry = origin) => importV1(db, { ...config, mediaRoot: root }, fixture(entry), "/seed/public", apply);

  assert.deepEqual((await run(false)).decisions.map(({ action }) => action), ["create"]);
  assert.deepEqual(await readdir(root), []);
  assert.equal(await db.contentEntry.count({ where: { id } }), 0);
  const first = await run(true);
  assert.equal(first.applied, true);
  assert.equal((await db.contentEntry.findUniqueOrThrow({ where: { id } })).sourceLabel, origin.source);
  assert.deepEqual(await readdir(root), [`${media.id}.webp`]);
  assert.equal(sum((await readFile(join(root, `${media.id}.webp`))).toString("hex")),
    sum((await readFile(join("/seed/public", media.path))).toString("hex")));
  assert.deepEqual((await run(true)).decisions.map(({ action }) => action), ["unchanged"]);
  assert.equal(await db.revision.count({ where: { entryId: id } }), 1);
  const updatedSource = { ...origin, payload: { ...origin.payload, title: "Fuente revisada de prueba" } };
  const cms = new EditorialService(db);
  assert.deepEqual((await run(false, updatedSource)).decisions.map(({ action }) => action), ["update"]);
  const saved = await cms.edit({ id, kind: "TRAINING" }, 1,
    { slug, position: 2, payload: { ...origin.payload, title: "Edición de OWNER" } }, { actorId: owner.id, requestId: randomUUID() });
  const conflict = await run(true, updatedSource);
  assert.equal(conflict.applied, false);
  assert.equal(conflict.conflicts, 1);
  assert.deepEqual((await cms.draft({ id, kind: "TRAINING" })).draftPayload, saved.draftPayload);
  assert.equal(await db.revision.count({ where: { entryId: id } }), 1);
});
