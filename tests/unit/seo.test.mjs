import test from "node:test";
import assert from "node:assert/strict";
import { getCanonicalOrigin } from "../../src/config/seo.ts";
import { importComponent } from "./render-component.mjs";

test("a temporary deployment is not silently made canonical", () => {
  assert.equal(getCanonicalOrigin(undefined), null);
  assert.equal(getCanonicalOrigin("https://approved.example"), "https://approved.example");
  for (const origin of ["http://approved.example", "https://user:secret@approved.example", "https://approved.example/path", "https://approved.example/?x=1", "https://approved.example/#fragment"]) assert.throws(() => getCanonicalOrigin(origin));
});

test("actual site configuration activates four approved channels, preserves the missing fifth and contexts", async () => {
  const { site, getContactLinks } = await importComponent("src/config/site.ts");
  assert.equal(site.whatsappNumber, "5216644846470");
  assert.equal(site.phoneNumber, "+526644846470");
  for (const interest of ["decoracion", "cursos", "talleres", "certificaciones", "asesorias", "general"]) {
    const links = getContactLinks(interest);
    assert.equal(links.filter(link => link.href).length, 4);
    assert.equal(links.find(link => link.id === "email").href, null);
    const whatsapp = new URL(links.find(link => link.id === "whatsapp").href);
    assert.equal(whatsapp.pathname, "/5216644846470");
    assert.ok(whatsapp.searchParams.get("text"));
  }
});
