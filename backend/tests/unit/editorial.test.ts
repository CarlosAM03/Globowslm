import { strict as assert } from "node:assert";
import { test } from "node:test";
import { assertPublishable, EditorialError, parsePayload } from "../../src/editorial/dto.js";

const site = {
  brandName: "Marca local",
  founderName: "Propietaria de prueba",
  hero: { title: "Hero de prueba" },
  about: { title: "Historia", history: "Contenido de pruebas." },
  seo: { title: "Marca local", description: "Descripción de prueba." },
  contact: {},
  faq: [],
};
const invalid = (error: unknown) => error instanceof EditorialError && error.getStatus() === 422;

test("optional commercial contact can be absent and social links must match their HTTPS hosts", () => {
  assert.deepEqual(parsePayload("SITE", site).data, site);
  assert.throws(() => parsePayload("SITE", {
    ...site, contact: { facebook: "https://example.invalid/perfil" },
  }), invalid);
  assert.throws(() => parsePayload("SITE", {
    ...site, contact: { instagram: "sin-url" },
  }), invalid);
});

test("new services require an image and certifications require verified issuer to publish", () => {
  const service = parsePayload("SERVICE", { title: "Servicio", description: "Descripción", ctaInterest: "general" });
  assert.throws(() => assertPublishable(service, false), invalid);
  assert.doesNotThrow(() => assertPublishable(service, true));
  const certification = parsePayload("CERTIFICATION", {
    title: "Certificación", issuer: "Organismo de prueba", verified: false, evidenceMediaRefs: [],
  });
  assert.throws(() => assertPublishable(certification, false), invalid);
});

test("blog accepts safe typed blocks and rejects HTML or unknown fields", () => {
  const post = { title: "Post", excerpt: "Resumen", tags: [], categoryRefs: [], blocks: [{ type: "paragraph", text: "Texto" }] };
  assert.doesNotThrow(() => assertPublishable(parsePayload("POST", post), false));
  assert.throws(() => parsePayload("POST", { ...post, extra: true }), invalid);
  assert.throws(() => parsePayload("POST", { ...post, blocks: [{ type: "paragraph", text: "<b>Texto</b>" }] }), invalid);
});
