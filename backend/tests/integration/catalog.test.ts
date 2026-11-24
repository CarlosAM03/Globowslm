import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialError } from "../../src/editorial/dto.js";
import { EditorialService, editorialState } from "../../src/editorial/editorial.js";

const errorStatus = (expected: number) => (error: unknown) => error instanceof EditorialError && error.getStatus() === expected;

test("catalog rules protect required images, references, order, version and logical archival", async (t) => {
  assert.equal(process.env.HARNESS_MODE, "test");
  const db = new DatabaseService(loadConfig(process.env));
  t.after(() => db.onModuleDestroy());
  const cms = new EditorialService(db);
  const actor = { actorId: randomUUID(), requestId: randomUUID() };
  const event = await cms.create("EVENT_TYPE", {
    slug: `evento-${randomUUID()}`, position: 30, payload: { title: "Evento local" },
  }, actor);
  const title = "Servicio local";
  const original = { slug: `servicio-${randomUUID()}`, position: 90, payload: { title, description: "Fixture", ctaInterest: "general", eventTypes: [event.id] } };
  await assert.rejects(cms.create("SERVICE", { ...original, payload: { ...original.payload, title: "" } }, actor), errorStatus(422));
  await assert.rejects(cms.create("SERVICE", {
    ...original, payload: { ...original.payload, eventTypes: [randomUUID()] },
  }, actor), errorStatus(409));

  const draft = await cms.create("SERVICE", original, actor);
  await assert.rejects(cms.transition(draft, draft.version, "PUBLISH", actor), errorStatus(422));
  const asset = await db.media.create({ data: {
    storageKey: randomUUID(), originalName: "catalog-fixture.png", mime: "image/png", size: 120,
    sha256: "0".repeat(64), status: "READY",
  } });
  const imageInput = { ...original, position: 1, payload: { ...original.payload, imageRef: asset.id } };
  const edited = await cms.edit(draft, draft.version, imageInput, actor);
  assert.equal(edited.position, 1);
  await assert.rejects(cms.edit(draft, draft.version, imageInput, actor), errorStatus(409));
  await assert.rejects(cms.transition(edited, edited.version, "PUBLISH", actor), errorStatus(409));

  const category = await cms.transition(event, event.version, "PUBLISH", actor);
  const published = await cms.transition(edited, edited.version, "PUBLISH", actor);
  assert.equal(editorialState(published), "PUBLISHED");
  await assert.rejects(cms.transition(category, category.version, "ARCHIVE", actor), errorStatus(409));
  const rows = (await cms.listDrafts("SERVICE", 1)).items;
  assert.deepEqual(rows.map(({ position }) => position), rows.map(({ position }) => position).sort((a, b) => a - b));
  const archived = await cms.transition(published, published.version, "ARCHIVE", actor);
  assert.ok(archived.archivedAt);
  assert.equal(await cms.published("SERVICE", archived.slug), null);
  const restored = await cms.transition(archived, archived.version, "RESTORE", actor);
  assert.equal(editorialState(restored), "DRAFT");
  assert.equal((restored.draftPayload as { imageRef: string }).imageRef, asset.id);
});
