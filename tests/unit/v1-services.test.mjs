import { strict as assert } from "node:assert";
import { test } from "node:test";
import { importComponent } from "./render-component.mjs";

test("five approved V1 services map to stable import records and preserve absent credential evidence", async () => {
  const { services } = await importComponent("src/content/services.ts");
  const { v1ServiceRecords } = await importComponent("src/lib/cms/v1-services.ts");
  const imageIds = new Map(services.filter(({ image }) => image?.approval === "approved")
    .map(({ image }, index) => [image.src, `test-media-${index}`]));
  const rows = v1ServiceRecords(services, imageIds);
  assert.deepEqual(rows.map(({ slug }) => slug), ["decoraciones", "cursos", "talleres", "certificaciones", "asesorias"]);
  assert.deepEqual(rows.map(({ position }) => position), [0, 1, 2, 3, 4]);
  assert.equal(new Set(rows.map(({ sourceKey }) => sourceKey)).size, 5);
  assert.deepEqual(rows.map(({ payload }) => payload.title), services.map(({ name }) => name));
  assert.ok(rows.every(({ source }) => source.length > 0));
  assert.equal(rows.filter(({ payload }) => payload.imageRef).length, 4);
  assert.equal(rows.find(({ slug }) => slug === "certificaciones").payload.imageRef, undefined);
  assert.throws(() => v1ServiceRecords(services, new Map()), /derivado aprobado/);
});
