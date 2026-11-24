import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialError } from "../../src/editorial/dto.js";
import { EditorialService, editorialState } from "../../src/editorial/editorial.js";
import { ContentKind } from "../../src/generated/prisma/client.js";

const actor = () => ({ actorId: randomUUID(), requestId: randomUUID() });
const uniqueSlug = (prefix: string) => `${prefix}-${randomUUID()}`;
const conflict = (error: unknown) => error instanceof EditorialError && error.getStatus() === 409;

function fixture(t: TestContext) {
  assert.equal(process.env.HARNESS_MODE, "test");
  const db = new DatabaseService(loadConfig(process.env));
  t.after(() => db.onModuleDestroy());
  return { db, cms: new EditorialService(db) };
}

test("edits preserve public snapshots until publication, with withdrawal and draft recovery", async (t) => {
  const { db, cms } = fixture(t);
  const slug = uniqueSlug("catalogo");
  const input = { slug, position: 4, payload: { title: "Primera versión" } };
  const draft = await cms.create(ContentKind.EVENT_TYPE, input, actor());
  assert.equal(editorialState(draft), "DRAFT");
  assert.equal(await cms.published(draft.kind, draft.slug), null);

  const published = await cms.transition(draft, draft.version, "PUBLISH", actor());
  const snapshot = await cms.published(draft.kind, draft.slug);
  assert.equal(editorialState(published), "PUBLISHED");
  assert.deepEqual(snapshot?.payload, input.payload);
  assert.equal(Object.hasOwn(snapshot ?? {}, "draftPayload"), false);

  const updatedInput = { ...input, position: 7, payload: { title: "Segunda versión" } };
  const edited = await cms.edit(draft, published.version, updatedInput, actor());
  assert.deepEqual(edited.draftPayload, updatedInput.payload);
  assert.deepEqual(await cms.published(draft.kind, draft.slug), snapshot);
  await assert.rejects(cms.edit(draft, edited.version, { ...updatedInput, slug: uniqueSlug("otro") }, actor()), conflict);

  const newRevision = await cms.transition(draft, edited.version, "PUBLISH", actor());
  assert.deepEqual((await cms.published(draft.kind, draft.slug))?.payload, updatedInput.payload);
  const withdrawn = await cms.transition(draft, newRevision.version, "WITHDRAW", actor());
  assert.equal(await cms.published(draft.kind, draft.slug), null);

  const archived = await cms.transition(draft, withdrawn.version, "ARCHIVE", actor());
  assert.ok(archived.archivedAt);
  await assert.rejects(cms.edit(draft, archived.version, updatedInput, actor()), conflict);
  const restored = await cms.transition(draft, archived.version, "RESTORE", actor());
  assert.equal(editorialState(restored), "DRAFT");
  assert.deepEqual(restored.draftPayload, updatedInput.payload);
  assert.equal(await cms.published(draft.kind, draft.slug), null);

  const history = await db.revision.findMany({ where: { entryId: draft.id }, orderBy: { revisionNo: "asc" } });
  assert.deepEqual(history.map(({ revisionNo, payload, position }) => ({ revisionNo, payload, position })), [
    { revisionNo: 1, payload: input.payload, position: 4 },
    { revisionNo: 2, payload: updatedInput.payload, position: 7 },
  ]);
  const audits = await db.auditEvent.findMany({ where: { entityId: draft.id } });
  assert.equal(audits.length, 7);
  assert.ok(audits.every((event) => event.outcome === "SUCCESS" && event.requestId.length === 36));
});

test("two writers with the same version produce one success and one conflict", async (t) => {
  const { db, cms } = fixture(t);
  const slug = uniqueSlug("concurrencia");
  const entry = await cms.create(ContentKind.BLOG_CATEGORY, { slug, payload: { title: "Inicial" } }, actor());
  const results = await Promise.allSettled([
    cms.edit(entry, entry.version, { slug, payload: { title: "Primera edición" } }, actor()),
    cms.edit(entry, entry.version, { slug, payload: { title: "Segunda edición" } }, actor()),
  ]);
  const successes = results.filter((result) => result.status === "fulfilled");
  const failures = results.filter((result) => result.status === "rejected");
  assert.equal(successes.length, 1);
  assert.equal(failures.length, 1);
  assert.ok(conflict(failures[0].reason));
  assert.equal(failures[0].reason.currentVersion, 2);
  assert.equal((await cms.draft(entry)).version, 2);
  assert.equal(await db.auditEvent.count({ where: { entityId: entry.id, action: "EDIT" } }), 1);
});

test("published references protect their dependencies and PostgreSQL enforces correct snapshots", async (t) => {
  const { db, cms } = fixture(t);
  const category = await cms.create(ContentKind.GALLERY_CATEGORY, {
    slug: uniqueSlug("categoria"), payload: { title: "Decoraciones" },
  }, actor());
  const media = await db.media.create({
    data: {
      storageKey: randomUUID(), originalName: "fixture.png", mime: "image/png",
      sha256: "0".repeat(64), size: 100, status: "STAGED",
    },
  });
  const gallery = await cms.create(ContentKind.GALLERY, {
    slug: uniqueSlug("galeria"),
    payload: { title: "Ejemplo local", categoryRef: category.id, orderedPhotoRefs: [{ mediaRef: media.id, alt: "Fixture" }] },
  }, actor());
  await assert.rejects(cms.transition(gallery, gallery.version, "PUBLISH", actor()), conflict);
  const publishedCategory = await cms.transition(category, category.version, "PUBLISH", actor());
  await assert.rejects(cms.transition(gallery, gallery.version, "PUBLISH", actor()), conflict);
  await db.media.update({ where: { id: media.id }, data: { status: "READY" } });
  const publishedGallery = await cms.transition(gallery, gallery.version, "PUBLISH", actor());
  assert.ok(publishedGallery.publishedRevisionId);
  await assert.rejects(cms.transition(category, publishedCategory.version, "WITHDRAW", actor()), conflict);

  await assert.rejects(db.contentEntry.update({
    where: { id: category.id },
    data: { publishedRevisionId: publishedGallery.publishedRevisionId },
  }), { code: "P2003" });
  await assert.rejects(db.media.delete({ where: { id: media.id } }), { code: "P2003" });
  await cms.transition(gallery, publishedGallery.version, "WITHDRAW", actor());
  await cms.transition(category, publishedCategory.version, "WITHDRAW", actor());
  assert.equal(await cms.published(category.kind, category.slug), null);
});

test("an audit write failure rolls back the new revision and leaves the previous snapshot visible", async (t) => {
  const { db, cms } = fixture(t);
  const slug = uniqueSlug("auditoria");
  const initial = await cms.create(ContentKind.EVENT_TYPE, { slug, payload: { title: "Visible" } }, actor());
  const published = await cms.transition(initial, initial.version, "PUBLISH", actor());
  const edited = await cms.edit(initial, published.version, { slug, payload: { title: "Borrador" } }, actor());
  const before = await cms.published(initial.kind, slug);
  await assert.rejects(cms.transition(initial, edited.version, "PUBLISH", { ...actor(), requestId: "invalid-fixture" }));
  assert.deepEqual(await cms.published(initial.kind, slug), before);
  assert.equal((await cms.draft(initial)).version, edited.version);
  assert.equal(await db.revision.count({ where: { entryId: initial.id } }), 1);
  assert.equal(await db.auditEvent.count({ where: { entityId: initial.id, action: "PUBLISH" } }), 1);
});

test("gallery photo order is snapshotted and one image can be reused in several decoration galleries", async (t) => {
  const { db, cms } = fixture(t);
  const category = await cms.create(ContentKind.GALLERY_CATEGORY, {
    slug: uniqueSlug("decoracion"), payload: { title: "Decoraciones de prueba" },
  }, actor());
  await cms.transition(category, category.version, "PUBLISH", actor());
  const photos = await Promise.all(["Rosa", "Temática"].map(async (alt) => {
    const asset = await db.media.create({ data: {
      storageKey: randomUUID(), originalName: "fixture.png", mime: "image/png",
      sha256: "1".repeat(64), size: 100, status: "READY",
    } });
    return { mediaRef: asset.id, alt };
  }));
  const input = {
    slug: uniqueSlug("orden"), position: 6,
    payload: { title: "Orden de montaje", categoryRef: category.id, featured: true, orderedPhotoRefs: photos },
  };
  const initial = await cms.create(ContentKind.GALLERY, input, actor());
  const original = await cms.transition(initial, initial.version, "PUBLISH", actor());
  const reordered = { ...input, payload: { ...input.payload, orderedPhotoRefs: [...photos].reverse() } };
  const draft = await cms.edit(initial, original.version, reordered, actor());
  assert.deepEqual((await cms.published(initial.kind, initial.slug))?.payload, input.payload);
  const published = await cms.transition(initial, draft.version, "PUBLISH", actor());
  assert.deepEqual((await cms.published(initial.kind, initial.slug))?.payload, reordered.payload);
  const refs = await db.revisionMediaRef.findMany({
    where: { revisionId: published.publishedRevisionId! }, orderBy: { position: "asc" },
  });
  assert.deepEqual(refs.map(({ mediaId }) => mediaId), [photos[1].mediaRef, photos[0].mediaRef]);
  const reused = await cms.create(ContentKind.GALLERY, {
    ...input, slug: uniqueSlug("reuso"), position: 1, payload: { ...input.payload, orderedPhotoRefs: [photos[0]] },
  }, actor());
  await cms.transition(reused, reused.version, "PUBLISH", actor());
  assert.ok(await cms.published(reused.kind, reused.slug));
  await assert.rejects(cms.create(ContentKind.GALLERY, {
    ...input, slug: uniqueSlug("duplicada"), payload: { ...input.payload, orderedPhotoRefs: [photos[0], photos[0]] },
  }, actor()), (error: unknown) => error instanceof EditorialError && error.getStatus() === 422);
});

test("credential timeline stays empty until issuer and verification are confirmed", async (t) => {
  const { db, cms } = fixture(t);
  const source = await db.media.create({ data: {
    storageKey: randomUUID(), originalName: "evidence-fixture.png", mime: "image/png",
    sha256: "3".repeat(64), size: 100, status: "READY",
  } });
  const slug = uniqueSlug("credencial-fixture");
  const input = {
    slug, position: 3,
    payload: { title: "Credencial de prueba", evidenceMediaRefs: [source.id], verified: false },
  };
  const draft = await cms.create(ContentKind.CERTIFICATION, input, actor());
  const rejected = (error: unknown) => error instanceof EditorialError &&
    error.getStatus() === 422 && Object.hasOwn(error.fieldErrors ?? {}, "verified");
  assert.equal(await cms.published(draft.kind, slug), null);
  await assert.rejects(cms.transition(draft, draft.version, "PUBLISH", actor()), rejected);
  assert.equal(await cms.published(draft.kind, slug), null);
  const noIssuer = await cms.edit(draft, draft.version, {
    ...input, payload: { ...input.payload, verified: true },
  }, actor());
  await assert.rejects(cms.transition(draft, noIssuer.version, "PUBLISH", actor()), rejected);

  const payload = { ...input.payload, verified: true, issuer: "Organismo de prueba", date: "2025-03-01" };
  const valid = await cms.edit(draft, noIssuer.version, { ...input, payload }, actor());
  const published = await cms.transition(draft, valid.version, "PUBLISH", actor());
  const snapshot = await cms.published(draft.kind, slug);
  assert.deepEqual(snapshot?.payload, payload);
  assert.equal(snapshot?.position, 3);
  assert.ok(published.publishedRevisionId);
  const refs = await db.revisionMediaRef.findMany({ where: { revisionId: published.publishedRevisionId } });
  assert.deepEqual(refs.map(({ mediaId, role }) => [mediaId, role]), [[source.id, "evidence"]]);
  await cms.transition(draft, published.version, "WITHDRAW", actor());
  assert.equal(await cms.published(draft.kind, slug), null);
});
