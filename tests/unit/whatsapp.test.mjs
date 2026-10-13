import assert from "node:assert/strict";
import { test } from "node:test";
import { createWhatsappUrl, normalizeWhatsappNumber, whatsappMessages } from "../../src/lib/whatsapp.ts";

// Fictional NANP reserved number for tests only; never a production contact.
const fixture = "+1 (202) 555-0100";

test("normalizes an international number without altering its country code", () => {
  assert.equal(normalizeWhatsappNumber(fixture), "12025550100");
});

test("rejects ambiguous or malformed recipients", () => {
  for (const number of ["", "0123456789", "555", "+1234567890123456", "abc12025550100", "+1 2025550100 ext 4", "++12025550100"]) {
    assert.throws(() => normalizeWhatsappNumber(number), RangeError);
  }
});

test("does not publish a URL when the official recipient is unavailable", () => {
  assert.equal(createWhatsappUrl(null, "general"), null);
  assert.equal(createWhatsappUrl("", "general"), null);
});

for (const [interest, message] of Object.entries(whatsappMessages)) {
  test(`encodes the ${interest} message without changing its contents`, () => {
    const href = createWhatsappUrl(fixture, interest);
    const url = new URL(href);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/12025550100");
    assert.equal(url.searchParams.get("text"), message);
    assert.equal(href, `https://wa.me/12025550100?text=${encodeURIComponent(message)}`);
  });
}
