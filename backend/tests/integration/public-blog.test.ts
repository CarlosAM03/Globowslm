import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";
import { EditorialError } from "../../src/editorial/dto.js";
import { EditorialService } from "../../src/editorial/editorial.js";
import { ContentKind } from "../../src/generated/prisma/client.js";

const actor = () => ({ actorId: randomUUID(), requestId: randomUUID() });
const status = (expected: number) => (error: unknown) =>
  error instanceof EditorialError && error.getStatus() === expected;

test("public blog lists only published snapshots with pagination, categories, safe blocks and approved media", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  const cms = new EditorialService(db);
  const prefix = randomUUID();
  const category = await cms.create(ContentKind.BLOG_CATEGORY, { slug: `categoria-${prefix}`, payload: { title: "Globos" } }, actor());
  const mediaFixture = (mime: string) => db.media.create({ data: {
    storageKey: randomUUID(), originalName: "fixture", mime, sha256: "4".repeat(64), size: 123, status: "READY",
    width: 24, height: 16, alt: "Descripción de prueba",
  } });
  const [cover, video] = await Promise.all([mediaFixture("image/webp"), mediaFixture("video/mp4")]);
  const input = {
    slug: `articulo-${prefix}`,
    payload: {
      title: "Artículo fixture", excerpt: "Resumen de prueba", tags: ["decoración"], coverRef: cover.id,
      categoryRefs: [category.id], blocks: [
        { type: "heading", text: "Preparación", level: 2 },
        { type: "paragraph", text: "Medida 3 < 5 y A & B" },
        { type: "list", ordered: true, items: ["Preparar", "Montar"] },
        { type: "image", mediaRef: cover.id, alt: "Imagen de muestra" },
        { type: "video", mediaRef: video.id, caption: "Vista del montaje" },
      ],
    },
  };
  await assert.rejects(cms.create(ContentKind.POST, {
    ...input, payload: { ...input.payload, blocks: [{ type: "paragraph", text: "<mark>texto editorial</mark>" }] },
  }, actor()), status(422));
  const draft = await cms.create(ContentKind.POST, input, actor());
  await assert.rejects(cms.create(ContentKind.POST, input, actor()), status(409));

  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const base = `${await app.getUrl()}/api/v1/public/posts`;
  const article = () => fetch(`${base}/${draft.slug}`);
  const listing = (page: number) => fetch(`${base}?category=${category.slug}&page=${page}`);

  assert.equal((await article()).status, 404);
  assert.deepEqual((await (await listing(1)).json()).items, []);
  await assert.rejects(cms.transition(draft, draft.version, "PUBLISH", actor()), status(409));
  const publishedCategory = await cms.transition(category, category.version, "PUBLISH", actor());
  const published = await cms.transition(draft, draft.version, "PUBLISH", actor());

  const response = await article();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const view = await response.json();
  assert.equal(view.author, "Globows LM");
  assert.deepEqual(view.categories, [{ slug: category.slug, title: "Globos" }]);
  assert.deepEqual(view.tags, ["decoración"]);
  assert.deepEqual(view.blocks.map((block: { type: string }) => block.type), ["heading", "paragraph", "list", "image", "video"]);
  assert.equal(view.blocks[3].media.id, cover.id);
  assert.equal(view.blocks[4].media.id, video.id);
  assert.equal(view.blocks[1].text, "Medida 3 < 5 y A & B");
  assert.equal(Object.hasOwn(view.cover, "storageKey"), false);
  assert.equal(Object.hasOwn(view.cover, "sha256"), false);
  assert.equal(Object.hasOwn(view, "version"), false);
  assert.ok(Number.isFinite(Date.parse(view.publishedAt)));
  await assert.rejects(cms.transition(category, publishedCategory.version, "ARCHIVE", actor()), status(409));

  for (let index = 0; index < 10; index++) {
    const row = await cms.create(ContentKind.POST, { ...input, slug: `pagina-${prefix}-${index}` }, actor());
    await cms.transition(row, row.version, "PUBLISH", actor());
  }
  const first = await (await listing(1)).json();
  const second = await (await listing(2)).json();
  assert.equal(first.total, 11);
  assert.equal(first.items.length, 10);
  assert.equal(second.items.length, 1);
  assert.equal(new Set([...first.items, ...second.items].map((item) => item.slug)).size, 11);
  assert.equal(Object.hasOwn(first.items[0], "blocks"), false);

  const updated = await cms.edit(draft, published.version, {
    ...input, payload: { ...input.payload, title: "Borrador privado" },
  }, actor());
  assert.equal((await (await article()).json()).title, "Artículo fixture");
  await cms.transition(draft, updated.version, "WITHDRAW", actor());
  assert.equal((await article()).status, 404);
  assert.equal((await (await listing(1)).json()).total, 10);
});
